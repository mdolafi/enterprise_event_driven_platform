const express = require('express');
const router = express.Router();
const voterController = require('../controllers/voterController');

router.post('/', voterController.castVote);
router.get('/:vote_id', voterController.getVoteById);
router.put('/:vote_id', voterController.updateVote);
router.delete('/:vote_id', voterController.deleteVote);

module.exports = router;