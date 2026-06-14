
const captainController = require('../controllers/captain.controller');
const express = require('express');
const router = express.Router();
const {body } = require('express-validator');

router.post('/register', [
    body('fullname').isLength({ min: 3 }).withMessage('Full name must be at least 3 characters long'),
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('phone').matches(/^\d{10}$/).withMessage('Phone number must be 10 digits long'),
    body('vehicle.color').isLength({ min: 3 }).withMessage('Vehicle color must be at least 3 characters long'), 
    body('vehicle.plate').isLength({ min: 3 }).withMessage('Vehicle plate must be at least 3 characters long'),
    body('vehicle.capacity').isInt({ min: 1 }).withMessage('Vehicle capacity must be at least 1'),
    body('vehicle.vehicleType').isIn(['car', 'bike', 'scooter']).withMessage('Vehicle type must be either car, bike, or scooter')
],
 require('../controllers/captain.controller').register);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email address'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], require('../controllers/captain.controller').login);




module.exports = router;