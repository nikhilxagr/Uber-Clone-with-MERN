const userModel = require('../models/user.model');

module.exports.createUser = async ({
fullName, email, password
}) => {

    if (!fullName || !email || !password) {
        throw new Error('All fields are required');
    }

    return userModel.create({
        fullName,
        email,
        password
    });

}
