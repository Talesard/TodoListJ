const express = require('express');
const authController = require('../controllers/authController');
const { cookieJwtAuth } = require('../middleware/cookieJwtAuth');

const authRouter = express.Router();

authRouter.post('/login', authController.login);
authRouter.post('/logout', cookieJwtAuth, authController.logout);
authRouter.post('/register', authController.register);

module.exports = authRouter;
