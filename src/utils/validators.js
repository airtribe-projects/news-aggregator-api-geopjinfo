import ApiError from './ApiError.js';
import { CATEGORIES, LANGUAGES, COUNTRIES, ERROR_CODES } from '../constants/constants.js';

function validatePreferences(categories, languages, country, keywords, sources) {
  const errors = [];

  if (categories && Array.isArray(categories)) {
    const invalidCats = categories.filter(c => !CATEGORIES.includes(c));
    if (invalidCats.length > 0) {
      errors.push({
        field: 'categories',
        message: `Invalid categories: ${invalidCats.join(', ')}. Valid options: ${CATEGORIES.join(', ')}`,
      });
    }
  }

  if (languages && Array.isArray(languages)) {
    const invalidLangs = languages.filter(l => !LANGUAGES.includes(l));
    if (invalidLangs.length > 0) {
      errors.push({
        field: 'languages',
        message: `Invalid languages: ${invalidLangs.join(', ')}. Valid options: ${LANGUAGES.join(', ')}`,
      });
    }
  }

  if (country && !COUNTRIES.includes(country)) {
    errors.push({
      field: 'country',
      message: `Invalid country: ${country}. Valid options: ${COUNTRIES.join(', ')}`,
    });
  }

  if (keywords != null && !Array.isArray(keywords)) {
    errors.push({ field: 'keywords', message: 'keywords must be an array of strings' });
  } else if (Array.isArray(keywords)) {
    const invalidKw = keywords.filter(k => typeof k !== 'string' || k.trim().length === 0);
    if (invalidKw.length > 0) {
      errors.push({ field: 'keywords', message: 'Each keyword must be a non-empty string' });
    }
  }

  if (sources != null && !Array.isArray(sources)) {
    errors.push({ field: 'sources', message: 'sources must be an array of strings' });
  } else if (Array.isArray(sources)) {
    const invalidSrc = sources.filter(s => typeof s !== 'string' || s.trim().length === 0);
    if (invalidSrc.length > 0) {
      errors.push({ field: 'sources', message: 'Each source must be a non-empty string' });
    }
  }

  if (errors.length > 0) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { errors });
  }
}

export {
  validatePreferences,
};
