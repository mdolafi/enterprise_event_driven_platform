const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file at user_service root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8000;

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors());

// Express built-in middleware to parse incoming JSON payloads
app.use(express.json());

// Health Check Endpoint (useful for Docker/Podman container health probes)
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'user_service' });
});

// Mount User Routes under /api/v1/users
app.use('/api/v1/users', require('./routes/userRoutes'));

// Global 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ detail: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ detail: 'Internal Server Error', error: err.message });
});

// Start Express Server
app.listen(PORT, () => {
    console.log(`User Microservice running on port ${PORT}`);
});