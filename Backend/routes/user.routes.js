const express = require('express');
const router = express.Router();
const {body} = require("express-validator");
const usercontroller = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body('fullName').trim().isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], usercontroller.registerUser);

router.post('/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], usercontroller.loginUser);

router.get('/profile', authMiddleware.authUser, usercontroller.getUserProfile);
router.get('/logout', authMiddleware.authUser, usercontroller.logoutUser);

module.exports = router;
