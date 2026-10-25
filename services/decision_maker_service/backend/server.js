const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env file
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8003;
app.use(cors());
app.use(express.json());
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'decision_maker_service' });
});

// Mount Decision Maker Routes
app.use('/api/v1/decision_makers', require('./routes/decisionMakerRoutes'));

// Global 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({ detail: 'Route not found' });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ detail: 'Internal Server Error', error: err.message });
});

// Only listen on port when executed directly (node server.js), NOT during Supertest imports
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Decision Maker Microservice running on port ${PORT}`);
    });
}

module.exports = app;