const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

router.post('/', notificationController.createNotification);
router.get('/:notification_id', notificationController.getNotificationById);
router.put('/:notification_id', notificationController.updateNotification);
router.delete('/:notification_id', notificationController.deleteNotification);

module.exports = router;