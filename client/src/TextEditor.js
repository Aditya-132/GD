import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import io from "socket.io-client";
import Quill from "quill";
import "quill/dist/quill.snow.css";
const Save_after_MS=2000
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote", "code-block"],
    ["clean"],
];

const TextEditor = () => {
    const { id: documentId } = useParams();
    const [socket, setSocket] = useState(null);
    const [quill, setQuill] = useState(null);

    useEffect(() => {
        // Connect to the Socket.IO server
        const s = io("http://server-dkph9t79p-googledocs-projects.vercel.app", { rejectUnauthorized: false });
        setSocket(s);

        // Cleanup function to disconnect the socket when the component unmounts
        return () => {
            s.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket || !quill) return;

        socket.once("load-document", (document) => {
            quill.setContents(document);
            quill.enable();
        });

        socket.emit("get-document", documentId);
    }, [socket, quill, documentId]);

    useEffect(() => {
        if (!socket || !quill) return;

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return;
            socket.emit("send-changes", delta);
        };

        quill.on("text-change", handler);

        return () => {
            quill.off("text-change", handler);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (!socket || !quill) return;

        const handler = (delta) => {
            quill.updateContents(delta);
        };

        socket.on("receive-changes", handler);

        return () => {
            socket.off("receive-changes", handler);
        };
    }, [socket, quill]);

    useEffect(() => {
        if (!socket || !quill) return;
    
        const interval = setInterval(() => {
            const delta = quill.getContents();
            socket.emit('save-document', delta);
        }, Save_after_MS);
    
        return () => {
            clearInterval(interval);
        };
    }, [socket, quill]);
    
    

    const wrapperRef = useCallback((wrapper) => {
        if (!wrapper) return;
        wrapper.innerHTML = "";
        const editor = document.createElement("div");
        wrapper.append(editor);
        const q = new Quill(editor, {
            theme: "snow",
            modules: { toolbar: TOOLBAR_OPTIONS },
        });
        q.setText("Loading...");
        setQuill(q);
    }, []);

    return <div className="container" ref={wrapperRef}></div>;
};

export default TextEditor;
