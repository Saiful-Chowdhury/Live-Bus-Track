const express = require('express');
const http = require("http");
const path = require('path');
const socketio = require("socket.io");

const app = express();

// Create HTTP server and pass the app instance
const server = http.createServer(app);

// Initialize Socket.IO with the server
const io = socketio(server);

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the 'public' folder
app.use(express.static(path.join(__dirname, "public")));

// Handle Socket.IO connection
io.on("connection", function (socket) {
    console.log("A user connected");

    // You can listen to events from the client (e.g., location updates)
    socket.on('sendLocation', (data) => {
        console.log("Location received:", data);

        // Broadcast the received location to all connected clients
        io.emit('locationUpdate', data);
    });

    // Handle socket disconnection
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });
});

// Define a route to render the index page
app.get("/", function (req, res) {
    res.render("index"); // Renders 'views/index.ejs'
});

// Start the server on port 3000
server.listen(3000, () => {
    console.log("Server is running on http://localhost:3000");
});
