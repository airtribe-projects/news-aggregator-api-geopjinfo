# News Aggregator API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A personalized news aggregator REST API built with Node.js (ES Modules), Express, MongoDB, and JWT authentication. Fetches news from NewsAPI.org based on per-user preferences, with in-memory caching, article interaction tracking, and keyword search.

---

## Features

- **User Authentication** - Registration and login with bcrypt password hashing and JWT sessions
- **User Preferences** - Per-user categories, languages, country, keywords, and sources
- **Personalized News** - Top headlines filtered by user preferences, with TTL cache
- **Article Interactions** - Mark articles as read or favorite; retrieve history per type
- **Keyword Search** - Full-text search via NewsAPI `/everything` endpoint
- **Request Validation** - Zod schema validation on all incoming requests
- **Structured Logging** - Pino JSON logging with per-request correlation IDs
- **API Documentation** - Swagger/OpenAPI explorer at `/api/docs`
- **Security** - Helmet headers, CORS, rate limiting, no stack trace leakage in production

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ (ES Modules) |
| Framework | Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT (`jsonwebtoken`) + bcrypt |
| HTTP Client | axios |
| Caching | node-cache (TTL-based, in-process) |
| Validation | Zod |
| Logging | Pino + pino-pretty |
| API Docs | Swagger UI (`swagger-jsdoc`) |
| Testing | Jest 30 + Supertest + mongodb-memory-server |

---

## Project Structure

```text
.
+-- public/                           # Static assets and documentation portal
+-- src/                              # Main application source code
|   +-- config/                       # Environment and configuration management
|   |   +-- env.js                    # Zod-validated environment config
|   |   +-- swagger.js                # OpenAPI/Swagger spec configuration
|   +-- constants/                    # Shared constants and magic strings
|   |   +-- constants.js              # Shared enums and magic strings
|   |   +-- errorDefinitions.js       # Error code -> status/message map
|   +-- controllers/                  # Request handlers (HTTP/REST logic)
|   |   +-- auth.controller.js        # Register and login handlers
|   |   +-- health.controller.js      # Health check handler
|   |   +-- news.controller.js        # News fetch and interaction handlers
|   |   +-- preferences.controller.js # User preferences handlers
|   +-- datasources/                  # External data connections
|   |   +-- cache.datasource.js       # node-cache wrapper
|   |   +-- db.datasource.js          # Mongoose connection + CRUD helpers
|   |   +-- externalNews.datasource.js# NewsAPI adapter
|   |   +-- newsApi.client.js         # axios NewsAPI HTTP client
|   +-- mappers/                      # Data transformation layer
|   |   +-- news.mapper.js            # External article -> internal DTO
|   +-- middlewares/                  # Custom Express middleware
|   |   +-- auth.middleware.js        # JWT verification
|   |   +-- error.middleware.js       # Global error handler
|   |   +-- notFound.middleware.js    # 404 handler
|   |   +-- rateLimit.middleware.js   # Rate limiting
|   |   +-- requestContext.middleware.js  # AsyncLocalStorage context setup
|   |   +-- requestLogger.middleware.js   # Pino request logging
|   |   +-- validate.middleware.js    # Zod request validation
|   +-- models/                       # Mongoose schemas and entity definitions
|   |   +-- ArticleInteraction.model.js   # Unified read/favourite tracking
|   |   +-- User.model.js             # User account schema
|   +-- repositories/                 # Data access layer (DB abstractions)
|   |   +-- articleInteraction.repository.js
|   |   +-- cache.repository.js
|   |   +-- news.repository.js
|   |   +-- preferences.repository.js
|   |   +-- user.repository.js
|   +-- routes/                       # API endpoint definitions
|   |   +-- auth.routes.js
|   |   +-- health.routes.js
|   |   +-- news.routes.js
|   |   +-- preferences.routes.js
|   |   +-- index.js                  # Route aggregator
|   +-- services/                     # Core business logic and use cases
|   |   +-- auth.service.js
|   |   +-- health.service.js
|   |   +-- news.service.js
|   |   +-- preferences.service.js
|   +-- utils/                        # Helper functions and shared utilities
|   |   +-- ApiError.js               # Typed error class
|   |   +-- async-handler.js          # asyncHandler wrapper
|   |   +-- jwt.js                    # JWT sign/verify helpers
|   |   +-- logger.js                 # Pino logger instance
|   |   +-- password.js               # bcrypt hash/compare helpers
|   |   +-- requestContext.js         # AsyncLocalStorage context accessors
|   |   +-- response.js               # sendSuccess / sendError helpers
|   |   +-- validators.js             # validateEmail/Password/Name/Preferences
|   +-- validators/                   # Zod request schemas (used by routes)
|   |   +-- auth.validator.js
|   |   +-- news.validator.js
|   |   +-- preferences.validator.js
|   +-- app.js                        # Express app initialization
|   +-- server.js                     # Server entry point and startup logic
+-- tests/                            # Test suites
|   +-- unit/                         # Isolated unit tests (no DB/network)
|   |   +-- controllers/              # auth, health, news, preferences
|   |   +-- repositories/             # articleInteraction, news, user
|   |   +-- services/                 # auth, health, news, preferences
|   |   +-- utils/                    # ApiError, jwt, news.mapper, password, response, validators
|   +-- integration/                  # Integration tests (in-memory MongoDB)
|   |   +-- routes/                   # auth, health, news, preferences routes
|   |   +-- server.test.js            # Full app integration suite
|   +-- e2e/                          # End-to-end flow tests
|   |   +-- auth-flow.e2e.test.js
|   |   +-- news-flow.e2e.test.js
|   +-- setup/                        # Shared test helpers
|       +-- db.setup.js               # MongoMemoryServer helpers
|       +-- env.setup.js              # Test environment variables
|       +-- jest.setup.js             # Global Jest setup
+-- package.json                      # Dependencies and scripts
+-- .env                              # Local environment variables (git-ignored)
+-- README.md                         # Project documentation
```

---

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB (local or Atlas)
- NewsAPI key from [newsapi.org](https://newsapi.org)

### Installation

```bash
git clone <repository-url>
cd news-aggregator
npm install
```

### Environment Variables

Create a `.env` file in the project root. The fastest way is to copy `.env.example` and adjust the values:

```bash
cp .env.example .env
```

Then verify the file contains values like:

```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/news_aggregator
JWT_SECRET=replace_with_a_strong_random_secret
JWT_EXPIRES_IN=1h
NEWS_API_KEY=your_newsapi_key_here
NEWS_API_BASE_URL=https://newsapi.org/v2
NEWS_API_PAGE_SIZE=20
NEWS_API_TIMEOUT_MS=10000
CACHE_TTL_SECONDS=900
CACHE_REFRESH_INTERVAL_MS=900000
LOG_LEVEL=info
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | Secret key for JWT signing |
| `NEWS_API_KEY` | No | `""` | NewsAPI.org API key; required for live news fetches |
| `NODE_ENV` | No | `development` | `development` / `test` / `production` |
| `PORT` | No | `3000` | Server port |
| `JWT_EXPIRES_IN` | No | `1h` | Token expiry |
| `CACHE_TTL_SECONDS` | No | `900` | News cache TTL (seconds) |
| `CACHE_REFRESH_INTERVAL_MS` | No | `900000` | Background cache refresh interval (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | No | `100` | Max requests per window |
| `RATE_LIMIT_WINDOW_MS` | No | `900000` | Rate limit window (ms) |

### Running

```bash
# Development (hot-reload via nodemon)
npm run dev

# Production
npm start
```

If port `3000` is already in use on your machine, set a different `PORT` value in `.env` before starting the app.

API docs are available at `http://localhost:<PORT>/api/docs` once the server is running.

Postman artifacts are available in the `docs/postman/` folder. Import `postman/news-aggregator.postman_collection.json` together with `postman/news-aggregator.local.postman_environment.json` to exercise the documented endpoints locally.

---

## API Reference

All protected endpoints require:

```
Authorization: Bearer <jwt_token>
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Create a new account |
| POST | `/login` | Authenticate and receive a JWT |

#### POST /register

```json
// Request body
{ "name": "Alice", "email": "alice@example.com", "password": "SecurePass1!" }

// 201 Response
{ "success": true, "message": "User registered successfully", "user": { "id": "...", "name": "Alice", "email": "alice@example.com" } }
```

#### POST /login

```json
// Request body
{ "email": "alice@example.com", "password": "SecurePass1!" }

// 200 Response
{ "success": true, "user": { "id": "...", "name": "Alice", "email": "alice@example.com" }, "token": "<jwt>" }
```

---

### Preferences

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/preferences` | Yes | Get current user preferences |
| PUT | `/preferences` | Yes | Update preferences |

#### PUT /preferences - valid fields

```json
{
  "categories": ["technology", "science"],
  "languages": ["en"],
  "country": "us",
  "keywords": ["AI", "cloud"],
  "sources": []
}
```

**Valid categories:** `business`, `entertainment`, `general`, `health`, `science`, `sports`, `technology`  
**Valid languages:** `ar`, `de`, `en`, `es`, `fr`, `it`, `pt`, `ru`, `zh`  
**Valid countries:** ISO 3166-1 alpha-2 codes (`us`, `gb`, `ca`, `au`, `de`, `fr`, `jp`, ...)

---

### News

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/news` | Yes | Personalized top headlines |
| POST | `/news/:id/read` | Yes | Mark article as read |
| POST | `/news/:id/favorite` | Yes | Mark article as favorite |
| GET | `/news/read` | Yes | List read articles |
| GET | `/news/favorites` | Yes | List favorite articles |
| GET | `/news/search/:keyword` | Yes | Search articles by keyword |

#### POST /news/:id/read & POST /news/:id/favorite

```json
// Request body - :id is the articleId (URL of the article)
{ "title": "Article Title", "url": "https://example.com/article" }
```

---

### Health

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/health` | No | DB connectivity and uptime check |

---

## Error Responses

All errors follow a consistent envelope:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request payload",
    "errors": [
      { "field": "body.categories.0", "message": "Invalid option: expected one of \"business\"|\"entertainment\"|\"general\"|\"health\"|\"science\"|\"sports\"|\"technology\"" }
    ]
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

| Code | HTTP Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Request body/params failed validation |
| `AUTHENTICATION_ERROR` | 401 | Missing or invalid JWT |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `AUTHORIZATION_ERROR` | 403 | Authenticated but not authorised |
| `NOT_FOUND` | 404 | Resource not found |
| `EMAIL_ALREADY_REGISTERED` | 409 | Duplicate email on register |
| `RATE_LIMIT_EXCEEDED` | 429 | News API or app rate limit reached |
| `INTERNAL_ERROR` | 500 | Unhandled server error |
| `EXTERNAL_API_ERROR` | 502 | NewsAPI upstream failure |
| `SERVICE_UNAVAILABLE` | 503 | Database unreachable |

---

## Caching

News results are cached per-user using `node-cache`:

- **Cache key**: `news:<userId>:<normalised-preferences-hash>`
- **TTL**: 15 minutes (configurable via `CACHE_TTL_SECONDS`)
- Cache is bypassed on first request and populated from the NewsAPI response
- A stale cached copy is retained as a fallback when the upstream news API rate limit is hit
- Updating preferences invalidates the cached preferences and per-user news entries so the next request fetches fresh articles

---

## Testing

The project uses Jest 30 with `--experimental-vm-modules` for full ESM support. An in-memory MongoDB instance (`mongodb-memory-server`) is used for all database tests - no external MongoDB required.

```bash
# All tests
npm test

# By layer
npm run test:unit
npm run test:integration
npm run test:e2e

# With coverage report
npm run test:coverage
```

### Test Coverage (as of last run)

| Layer | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| Controllers | 100% | 100% | 100% | 100% |
| Services | ~99% | ~93% | 100% | 100% |
| Routes | 100% | 100% | 100% | 100% |
| Mappers | 100% | 100% | 100% | 100% |
| Utils | ~95% | ~87% | ~95% | ~94% |
| Repositories | ~76% | ~58% | ~83% | ~77% |

---

## Known Limitations

- **In-process cache**: `node-cache` is not shared across multiple Node.js instances. Use Redis for multi-instance deployments.
- **In-process rate limiter**: Rate limit state is lost on restart and not shared across processes. A Redis-backed adapter (e.g. `rate-limit-redis`) is recommended for production.
- **NewsAPI free tier**: Only allows requests from `localhost`. A paid plan is required for production use, and the free tier enforces a low daily request quota.
- **No token revocation**: JWTs cannot be invalidated before expiry. There is no refresh-token mechanism or blocklist.
- **No pagination**: The read and favorite article list endpoints return all records. Cursor or offset pagination should be added for large datasets.
- **Embedded preferences**: User preferences are stored as embedded fields on the User document, meaning any preference update rewrites the user record.

---

## License

Distributed under the **ISC License**. See `LICENSE` for more information.