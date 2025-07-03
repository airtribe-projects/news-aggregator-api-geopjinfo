const User = require('../models/user.model');
const CustomError = require('../utils/custom-error');

const getPreferences = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId).select('preferences');

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    res.json({
      success: true,
      preferences: user.preferences,
    });
  } catch (err) {
    next(err);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    const { preferences } = req.body;

    const user = await User.findById(req.user.userId);

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    if (preferences) {
      user.preferences = preferences;
    }

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.preferences,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPreferences,
  updatePreferences,
};
