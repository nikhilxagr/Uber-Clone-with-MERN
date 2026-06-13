const userModel = require('../models/user.model');
const bcryot = require('bcrypt');
const jwt = require('jsonwebtoken');


model.exports.authUser = async (req,res,next) =>{
    const token = req.cookies.token || req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const isBlacklisted = await blacklistTokenModel.findOne({ token: token });

    if (isBlacklisted) {
        return res.status(401).json({ error: 'Token is blacklisted. Please login again.' });
    }

    try {

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded._id);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token.' });
        }
        req.user = user;
        return next();

    } catch (err) {
        res.status(400).json({ error: 'Unauthorized Access' });
    }
}