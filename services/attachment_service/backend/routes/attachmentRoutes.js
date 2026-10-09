const express = require('express');
const router = express.Router();
const attachmentController = require('../controllers/attachmentController');

router.post('/', attachmentController.createAttachment);
router.get('/:attachment_id', attachmentController.getAttachmentById);
router.put('/:attachment_id', attachmentController.updateAttachment);
router.delete('/:attachment_id', attachmentController.deleteAttachment);

module.exports = router;