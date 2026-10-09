const express = require('express');
const router = express.Router();
const investigationController = require('../controllers/investigationController');

router.post('/', investigationController.createInvestigation);
router.get('/:investigation_id', investigationController.getInvestigationById);
router.put('/:investigation_id', investigationController.updateInvestigation);
router.delete('/:investigation_id', investigationController.deleteInvestigation);

module.exports = router;