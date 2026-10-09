const express = require('express');
const router = express.Router();
const submitterController = require('../controllers/submitterController');

router.post('/', submitterController.createSubmission);
router.get('/:submission_id', submitterController.getSubmissionById);
router.put('/:submission_id', submitterController.updateSubmission);
router.delete('/:submission_id', submitterController.deleteSubmission);

module.exports = router;