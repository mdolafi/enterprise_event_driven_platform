const express = require('express');
const router = express.Router();
const eventStoreController = require('../controllers/eventStoreController');

router.post('/', eventStoreController.createEvent);
router.get('/:event_id', eventStoreController.getEventById);
router.put('/:event_id', eventStoreController.updateEvent);
router.delete('/:event_id', eventStoreController.deleteEvent);

module.exports = router;