const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/', userController.createUser);
router.get('/:user_id', userController.getUserById);
router.put('/:user_id', userController.updateUser);
router.delete('/:user_id', userController.deleteUser);

module.exports = router;