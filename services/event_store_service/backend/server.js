const express = require('express');
const cors = require('cors');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8007;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', service: 'event_store_service' });
});

// Mount routes under /api/v1/events to align with integration test suite
app.use('/api/v1/events', require('./routes/eventStoreRoutes'));

app.use((req, res) => {
    res.status(404).json({ detail: 'Route not found' });
});

app.use((err, req, res, next) => {
    console.error('Unhandled Server Error:', err.stack);
    res.status(500).json({ detail: 'Internal Server Error', error: err.message });
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Event Store Microservice running on port ${PORT}`);
    });
}

module.exports = app;