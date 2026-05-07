// ── HTTP Status Codes ─────────────────────────────────────────────────────────
const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
};

// ── Application Error Codes ───────────────────────────────────────────────────
const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_REGISTERED: 'EMAIL_ALREADY_REGISTERED',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  INVALID_EMAIL_FORMAT: 'INVALID_EMAIL_FORMAT',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_NAME: 'INVALID_NAME',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
};

// ── News Preference Options ───────────────────────────────────────────────────
const CATEGORIES = [
  'business',
  'entertainment',
  'general',
  'health',
  'science',
  'sports',
  'technology',
];

const LANGUAGES = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ru', 'ar', 'zh'];

const COUNTRIES = [
  'ae', 'ar', 'at', 'au', 'be', 'bg', 'br', 'by', 'ca', 'ch', 'cn', 'co', 'cu',
  'cz', 'de', 'eg', 'fr', 'gb', 'gr', 'hk', 'hu', 'id', 'ie', 'il', 'in', 'it',
  'jp', 'kr', 'lt', 'lv', 'ma', 'mx', 'my', 'ng', 'nl', 'no', 'nz', 'ph', 'pl',
  'pt', 'ro', 'rs', 'ru', 'sa', 'se', 'sg', 'si', 'sk', 'th', 'tr', 'tw', 'ua',
  'us', 've', 'za',
];

const INTERACTION_TYPES = {
  READ: 'read',
  FAVORITE: 'favorite',
};

// ── News Preference Defaults ──────────────────────────────────────────────────
const DEFAULT_LANGUAGE = 'en';
const DEFAULT_COUNTRY = 'us';

// ── Cache ─────────────────────────────────────────────────────────────────────
const CACHE_CHECK_PERIOD_SECONDS = 120;
const NEWS_CACHE_KEY_PREFIX = 'news:';
const NEWS_STALE_CACHE_KEY_PREFIX = 'news:stale:';

// ── NewsAPI error codes returned in response body ─────────────────────────────
const NEWS_API_ERROR_CODES = {
  RATE_LIMITED: 'rateLimited',
  API_KEY_EXHAUSTED: 'apiKeyExhausted',
  API_KEY_DISABLED: 'apiKeyDisabled',
  API_KEY_INVALID: 'apiKeyInvalid',
  API_KEY_MISSING: 'apiKeyMissing',
};

// ── Auth / Security ───────────────────────────────────────────────────────────
const SALT_ROUNDS = 10;
const JWT_ERROR_NAMES = ['JsonWebTokenError', 'TokenExpiredError', 'NotBeforeError'];
const BEARER_PREFIX = 'Bearer ';

export {
  HTTP_STATUS,
  ERROR_CODES,
  CATEGORIES,
  LANGUAGES,
  COUNTRIES,
  INTERACTION_TYPES,
  DEFAULT_LANGUAGE,
  DEFAULT_COUNTRY,
  CACHE_CHECK_PERIOD_SECONDS,
  NEWS_CACHE_KEY_PREFIX,
  NEWS_STALE_CACHE_KEY_PREFIX,
  NEWS_API_ERROR_CODES,
  SALT_ROUNDS,
  JWT_ERROR_NAMES,
  BEARER_PREFIX,
};
