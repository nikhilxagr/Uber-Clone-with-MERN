const captainModel = require('../models/captain.model');


module.exports.createCaptain = async (captainData) => {
    const { fullname, email, password, phone, vehicle, location } = captainData;

    if (!fullname || !email || !password || !vehicle) {
        throw new Error('All fields are required');
    }

    return captainModel.create({
        fullname,
        email,
        password,
        phone,
        vehicle,
        location
    });
};

module.exports.loginCaptain = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
}
