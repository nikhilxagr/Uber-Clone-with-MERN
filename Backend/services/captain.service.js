const captainModel = require('../models/captain.model');


module.exports.createCaptain = async (captainData) => {
    const { firstname, lastname, email, password, phone, vehicle, location } = captainData;

    if (!firstname || !lastname || !email || !password || !phone || !vehicle || !location) {
        throw new Error('All fields are required');
    }


const captain = captainModel.create({
    fullname: `${firstname} ${lastname}`,
    email,
    password,
    vehicle:{
        color,
        plate,
        capacity,
        vehicleType
    },
})

return captain;
};

module.exports.loginCaptain = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and password are required');
    }
}