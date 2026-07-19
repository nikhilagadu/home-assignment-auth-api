const users = require("../data/users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuid } = require("uuid");
const SECRET = "mysecretkey";
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    const exist = users.find(x => x.email === email);
    if (exist) {
        return res.status(400).json({
            message: "Email already exists"
        });
    }
    const hash = await bcrypt.hash(password, 10);
    users.push({
        id: uuid(),
        name,
        email,
        password: hash,
        resetToken: null
    });
    res.json({
        success: true,
        message: "User Registered"
    });
};
exports.login = async (req, res) => {
    const { email, password } = req.body;
    const user = users.find(x => x.email === email);
    if (!user)
        return res.status(404).json({
            message: "User not found"
        });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
        return res.status(400).json({
            message: "Invalid Password"
        });
    const token = jwt.sign(
        {
            id: user.id,
            email: user.email
        },
        SECRET,
        {
            expiresIn: "1h"
        }
    );
    res.json({
        success: true,
        token
    });
};
exports.forgotPassword = (req, res) => {
    const { email } = req.body;
    const user = users.find(x => x.email === email);
    if (!user)
        return res.status(404).json({
            message: "User not found"
        });
    const token = uuid();
    user.resetToken = token;
    res.json({
        message: "Reset Token Generated",
        resetToken: token
    });
};
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;
    const user = users.find(x => x.resetToken === token);
    if (!user)
        return res.status(400).json({
            message: "Invalid Token"
        });
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetToken = null;
    res.json({
        message: "Password Reset Successfully"
    });
};