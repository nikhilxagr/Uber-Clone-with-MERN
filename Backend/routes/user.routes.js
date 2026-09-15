const express = require('express');
const router = express.Router();
const {body} = require("express-validator");
const usercontroller = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');


router.post('/register', [
    body().custom((value, { req }) => {
      const name = req.body.fullName || (req.body.fullname ? (typeof req.body.fullname === 'object' ? `${req.body.fullname.firstname || ''} ${req.body.fullname.lastname || ''}`.trim() : req.body.fullname) : '');
      if (!name || name.length < 3) {
        throw new Error('Full name must be at least 3 characters long');
      }
      return true;
    }),
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
