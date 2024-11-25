const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve the frontend static files
app.use(express.static('public')); // Assuming your `index.html` is in the 'public' folder

// In-memory storage for device locations (can be replaced with a database)
let locations = {};

// Handle new connections from clients (e.g., bus devices)
io.on('connection', (socket) => {
    console.log('A user connected.');

    // Listen for location updates from a bus device
    socket.on('sendLocation', (data) => {
        console.log(`Received location from ${data.deviceId}: Latitude ${data.latitude}, Longitude ${data.longitude}`);

        // Save or update location for the device
        locations[data.deviceId] = data;

        // Broadcast the location to all connected clients
        io.emit('locationUpdate', data);
    });

    socket.on('disconnect', () => {
        console.log('A user disconnected');
    });
});

// Start the server on port 5000
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
