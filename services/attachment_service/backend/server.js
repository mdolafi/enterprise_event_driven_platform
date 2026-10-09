const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file at attachment_service root
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8006;

// Enable Cross-Origin Resource Sharing (CORS) for frontend requests
app.use(cors());

// Parse JSON payload bodies
app.use(express.json());

// Health Check Endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'attachment_service' });
});

// Mount Attachment Routes
app.use('/api/v1/attachments', require('./routes/attachmentRoutes'));

// Global 404 Handler
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
    console.log(`Attachment Microservice running on port ${PORT}`);
});