const express = require('express');
const router = express.Router();
const decisionMakerController = require('../controllers/decisionMakerController');

router.post('/', decisionMakerController.recordDecision);
router.get('/:decision_id', decisionMakerController.getDecisionById);
router.put('/:decision_id', decisionMakerController.updateDecision);
router.delete('/:decision_id', decisionMakerController.deleteDecision);

module.exports = router;