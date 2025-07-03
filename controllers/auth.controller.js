const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const CustomError = require('../utils/custom-error');

const register = async (req, res, next) => {
  try {
    const { email, password, preferences } = req.body;

    // Validation
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new CustomError('Email already registered', 409);
    }

    const user = new User({ email, password ,preferences});
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      throw new CustomError('Email and password are required', 400);
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new CustomError('Invalid credentials', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new CustomError('Invalid credentials', 401);
    }

    const payload = { userId: user._id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        email: user.email,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
