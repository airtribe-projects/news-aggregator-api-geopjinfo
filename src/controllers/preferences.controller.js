import preferencesService from '../services/preferences.service.js';
import { sendSuccess } from '../utils/response.js';

const getPreferences = async (req, res) => {
  const userId = req.user.userId;
  const preferences = await preferencesService.getPreferences(userId);
  sendSuccess(res, preferences);
};

const updatePreferences = async (req, res) => {
  const userId = req.user.userId;
  const preferences = await preferencesService.updatePreferences(userId, req.body);
  sendSuccess(res, preferences, 200, {}, 'Preferences updated successfully');
};

export default {
  getPreferences,
  updatePreferences,
};
