const express = require('express');
const mongoose = require('mongoose');
const Document = require('./Document');
const cors = require('cors');

const defaultValue = "";
const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

mongoose.connect(`mongodb+srv://adityachincholkar11:${encodeURIComponent('Aditya@2004')}@cluster0.li06ml3.mongodb.net/myDatabase?retryWrites=true&w=majority`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const io = require('socket.io')(server, {
    cors: {
        origin: "https://gd-coral.vercel.app",
        methods: ['GET', 'POST']
    }
});

io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    socket.on("get-document", async (documentId) => {
        try {
            const document = await findOrCreateDocument(documentId);
            socket.join(documentId);
            socket.emit('load-document', document.data);
            socket.on('send-changes',(delta)=>{
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            });
            socket.on('save-document', async (data) => {
                await Document.findByIdAndUpdate(documentId, { data });
            });
        } catch (error) {
            console.error("Error getting document:", error);
            socket.emit('load-document-error', { message: "Error loading document" });
        }
    });

    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    });
});

async function findOrCreateDocument(id) {
    if (!id) return;
    let document = await Document.findById(id);
    if (!document) {
        document = await Document.create({
            _id: id,
            data: defaultValue
        });
    }
    return document;
}
