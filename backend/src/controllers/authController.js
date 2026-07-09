const bcrypt = require("bcryptjs");

const User = require("../models/User");
const generateToken = require("../config/jwt");


// REGISTER
const register = async (req, res) => {
  try {

    const {
      username,
      email,
      password
    } = req.body;

    const userExists =
      await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "User registered",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// LOGIN
const login = async (req, res) => {

  try {

    const {
      email,
      password
    } = req.body;

    const user =
      await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Email not found"
      });
    }

    const match =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!match) {
      return res.status(400).json({
        message: "Wrong password"
      });
    }

    const token =
      generateToken(user._id);

    user.lastLogin =
      new Date();

    await user.save();

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const getProfile = async (req, res) => {
  res.json(req.user);
};

module.exports = {
  register,
  login,
  getProfile
};
