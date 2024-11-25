// Initialize Socket.IO connection
const socket = io(); // Assumes the backend is running on the same domain or specify URL

// Store previous position for distance calculation
let lastPosition = null;
let totalDistance = 0; // Total distance traveled (in meters)

// Check if geolocation is available
if (navigator.geolocation) {
    // Watch the user's position and send updates to the server
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude, speed } = position.coords; // Get latitude, longitude, and speed

            // If there is a previous position, calculate the distance
            if (lastPosition) {
                // Calculate distance between last position and current position (in meters)
                const distance = calculateDistance(lastPosition.latitude, lastPosition.longitude, latitude, longitude);
                totalDistance += distance; // Add distance to total

                console.log(`Distance traveled: ${distance.toFixed(2)} meters`);
            }

            // Update the last position to the current position
            lastPosition = { latitude, longitude };

            // Send the location and speed to the backend server
            socket.emit('sendLocation', {
                latitude,
                longitude,
                speed, // Send speed to backend as well
            });

            console.log(`Location sent: Latitude ${latitude}, Longitude ${longitude}, Speed: ${speed} m/s`);
        },
        (error) => {
            console.error('Error getting location:', error.message);
        },
        {
            enableHighAccuracy: true, // Use GPS for more accurate results
            maximumAge: 10000, // Allow cached positions up to 10 seconds old
            timeout: 10000, // Timeout after 10 seconds
        }
    );
} else {
    console.error('Geolocation is not supported by this browser.');
}

// Initialize the map
const map = L.map('map').setView([0, 0], 10); // Initial map center (you can adjust it to a default location)

// Add tile layer to the map (using OpenStreetMap)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Add a default marker that will be updated with the live GPS coordinates
const marker = L.marker([0, 0]).addTo(map); // Marker is initially at [0, 0]

// Listen for live location updates from the server
socket.on('locationUpdate', (data) => {
    const { latitude, longitude, speed } = data;

    // Update the map center to the new location
    map.setView([latitude, longitude], 13); // Adjust zoom level as necessary

    // Update the marker position
    marker.setLatLng([latitude, longitude]);

    // Display speed and distance in the console or on the UI
    console.log(`Received location: Latitude ${latitude}, Longitude ${longitude}, Speed: ${speed} m/s`);

    // Optionally, display speed and distance on the map UI (you can add custom HTML or use Leaflet popups)
    marker.bindPopup(`
        <b>Latitude:</b> ${latitude}<br>
        <b>Longitude:</b> ${longitude}<br>
        <b>Speed:</b> ${speed} m/s<br>
        <b>Total Distance:</b> ${totalDistance.toFixed(2)} meters
    `).openPopup();
});

// Function to calculate distance between two lat/lon points using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180; // Latitude in radians
    const φ2 = lat2 * Math.PI / 180; // Latitude in radians
    const Δφ = (lat2 - lat1) * Math.PI / 180; // Latitude difference in radians
    const Δλ = (lon2 - lon1) * Math.PI / 180; // Longitude difference in radians

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Distance in meters
    return R * c;
}
