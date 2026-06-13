const userModel = require('../models/user.model');
const userService = require('../services/user.service');
const { validationResult } = require('express-validator');
const blacklistTokenModel = require('../models/blackListToken.model');

module.exports.registerUser = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { fullName, email, password, role } = req.body;

    const hashedPassword = await userModel.hashPassword(password);

    const user = await userService.createUser({
        fullName,
        email,
        password: hashedPassword,
        role
    });

    const token = user.generateAuthToken();

    res.status(201).json({ user, token });

}

module.exports.loginUser = async (req, res, next) => {
    const error = validationResult(req);
    if (!error.isEmpty()) {
        return res.status(400).json({ errors: error.array() });
    }

    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await userModel.comparePassword(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = user.generateAuthToken();
    res.cookie('token', token,{
        httpOnly:true,
        secure:process.env.NODE_ENV === 'production',
        maxAge:3600000
    })

    res.status(200).json({ user, token });
};

module.exports.getUserProfile = async (req,res,next) =>{
    res.clearCookie('token');
    const token = req.cookies.token|| req.header.authorization.split(' ')[1];
    if(!token){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    res.status(200).json({ user: req.user });
}

module.exports.logoutUser = async (req,res,next) =>{

    res.clearCookie('token');

    const token = req.cookies.token || req.header.authorization.split(' ')[1];

    if(!token){
        return res.status(401).json({ error: 'Unauthorized' });
    }
    await userService.blacklistToken(token);
    res.status(200).json({ message: 'Logged out successfully' });
}
