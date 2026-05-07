import userRepository from './user.repository.js';
import { defaultPreferences } from '../models/User.model.js';

const findByUserId = async (userId) => userRepository.getPreferences(userId);

const createDefault = async (userId) => userRepository.updatePreferences(userId, { ...defaultPreferences });

const updateByUserId = async (userId, preferences) => {
  const user = await userRepository.updatePreferences(userId, preferences);
  return user ? user.preferences : null;
};

export default {
  findByUserId,
  createDefault,
  updateByUserId,
};
