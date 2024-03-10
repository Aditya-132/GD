// Importing necessary modules
const mongoose = require('mongoose');
const Document = require('./Document'); // Assuming Document is a Mongoose model

// Setting a default value for the document data
const defaultValue = "";

// Connecting to MongoDB using Mongoose
mongoose.connect(`mongodb+srv://adityachincholkar11:${encodeURIComponent('Aditya@2004')}@cluster0.li06ml3.mongodb.net/myDatabase?retryWrites=true&w=majority`, {
    useNewUrlParser: true, // Option to use new URL parser
    useUnifiedTopology: true, // Option to use new Server Discover and Monitoring engine
});

// Setting up Socket.IO server
const io = require('socket.io')(3001, {
    cors: {
        origin: "https://gd-coral.vercel.app/",
        methods: ['GET', 'POST']
    }
});

// Handling Socket.IO connections
io.on('connection', (socket) => {
    console.log(`${socket.id} connected`);

    // Handling "get-document" event
    socket.on("get-document", async (documentId) => {
        try {
            // Finding or creating a document based on ID
            const document = await findOrCreateDocument(documentId);
            socket.join(documentId);
            socket.emit('load-document', document.data); // Emitting document data to the client
            // Listening for changes from the client
            socket.on('send-changes',(delta)=>{
                // Broadcasting changes to all other clients
                socket.broadcast.to(documentId).emit('receive-changes', delta);
            });
            // Handling "save-document" event
            socket.on('save-document', async (data) => {
                // Updating the document data in the database
                await Document.findByIdAndUpdate(documentId, { data });
            });
        } catch (error) {
            console.error("Error getting document:", error);
            // Emitting error message to the client
            socket.emit('load-document-error', { message: "Error loading document" });
        }
    });

    // Handling disconnection
    socket.on('disconnect', () => {
        console.log(`${socket.id} disconnected`);
    });
});

// Function to find or create a document based on ID
async function findOrCreateDocument(id) {
    if (!id) return;
    let document = await Document.findById(id);
    if (!document) {
        // Creating a new document if it doesn't exist
        document = await Document.create({
            _id: id,
            data: defaultValue
        });
    }
    return document;
}
