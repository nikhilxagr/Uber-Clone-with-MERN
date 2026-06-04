const express = require('express');
const router = express.Router();
const {body} = require("express-validator");
const usercontroller = require('../controllers/user,controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').isIn(['rider', 'driver']).withMessage('Role must be either rider or driver')
], usercontroller.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], usercontroller.loginUser);

router.get('/profile', authMiddleware.authUser, usercontroller.getUserProfile);

module.exports = router;