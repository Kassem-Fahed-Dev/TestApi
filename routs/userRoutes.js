const express = require('express');
const authController = require('./../controllers/authController.js');
const userController = require('./../controllers/userController.js');
const router = express.Router();

router.get('/', userController.getAllUsers);
router.post('/singup', authController.singUp);
router.post('/login', authController.login);

module.exports = router;
