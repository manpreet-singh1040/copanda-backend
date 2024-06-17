//hash and compare passwords
const bcrypt = require('bcrypt-node');
const saltRounds = parseInt(process.env.SALT) || 10;

const HashPassword = async (plainPassword) => {
    try {
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        return hash;
    } catch(error) {
        console.error("Error Hashing Password: ", error)
        throw error
    }
}

const CheckPassword = async (plainPassword, hashedPassword) => {
    try {
        const valid = await bcrypt.compare(plainPassword, hashedPassword);
        return valid;
    } catch(error) {
        console.error("Error checking Password: ", error)
        throw error;
    }
}

modeule.exports =  {HashPassword, CheckPassword};