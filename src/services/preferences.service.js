import { validatePreferences } from '../utils/validators.js';
import ApiError from '../utils/ApiError.js';
import preferencesRepository from '../repositories/preferences.repository.js';
import cacheRepository from '../repositories/cache.repository.js';
import { defaultPreferences } from '../models/User.model.js';
import { ERROR_CODES } from '../constants/constants.js';

const getPreferences = async (userId) => {
  const cached = cacheRepository.getPreferences(userId);
  if (cached) return cached;

  const preferences = await preferencesRepository.findByUserId(userId);

  if (preferences === null) {
    const user = await preferencesRepository.createDefault(userId);
    if (!user) throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
    const result = user.preferences ?? { ...defaultPreferences };
    cacheRepository.setPreferences(userId, result);
    return result;
  }

  cacheRepository.setPreferences(userId, preferences);
  return preferences;
};

const updatePreferences = async (userId, preferencesData) => {
  // Validate the preferences
  validatePreferences(
    preferencesData.categories,
    preferencesData.languages,
    preferencesData.country,
    preferencesData.keywords,
    preferencesData.sources
  );

  const preferences = {
    categories: preferencesData.categories || defaultPreferences.categories,
    languages: preferencesData.languages || defaultPreferences.languages,
    country: preferencesData.country || defaultPreferences.country,
    keywords: preferencesData.keywords || defaultPreferences.keywords,
    sources: preferencesData.sources || defaultPreferences.sources,
  };

  const updated = await preferencesRepository.updateByUserId(userId, preferences);
  if (updated === null) {
    throw new ApiError(ERROR_CODES.USER_NOT_FOUND);
  }

  // Invalidate preferences cache and all news caches for this user so the
  // next request re-fetches articles using the updated preferences.
  cacheRepository.deletePreferences(userId);
  cacheRepository.deleteNewsByUser(userId);

  return updated;
};

export default {
  getPreferences,
  updatePreferences,
};
