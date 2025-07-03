# News Aggregator API

A RESTful API that delivers personalized news articles using user preferences, external news APIs (like NewsAPI.org), token-based authentication (JWT), MongoDB, and caching.

---

## Features

- ✅ User registration & secure login (JWT + bcrypt)
- ✅ Store & update user preferences (language, categories)
- ✅ Fetch news from external API based on preferences
- ✅ Caching with `node-cache` for performance
- ✅ Mark articles as **read** or **favorite**
- ✅ Retrieve history of read/favorite articles
- ✅ Search articles by keyword
- ✅ Proper error handling & input validation

## Tech Stack

- **Node.js** / **Express.js**
- **MongoDB** with **Mongoose**
- **bcrypt** for password hashing
- **jsonwebtoken** for auth
- **node-cache** for in-memory caching
- **axios** for API calls
- Custom error handler for graceful responses

## Installation

```bash
git clone https://github.com/airtribe-projects/news-aggregator-api-geopjinfo
cd news-aggregator-api-geopjinfo
npm install
````

> Edit `.env` with your MongoDB URI and News API Key.

## .env Example

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/newsAggregator
JWT_SECRET=your_jwt_secret
NEWS_API_KEY=your_newsapi_key
CACHE_TTL_SECONDS=900
```

## Authentication

| Endpoint             | Method | Description       |
| -------------------- | ------ | ----------------- |
| `/api/auth/register` | POST   | Register new user |
| `/api/auth/login`    | POST   | Login & get JWT   |


## Preferences

| Endpoint           | Method | Auth Required | Description          |
| ------------------ | ------ | ------------- | -------------------- |
| `/api/preferences` | GET    | ✅ Yes         | Get user preferences |
| `/api/preferences` | PUT    | ✅ Yes         | Update preferences   |



## News

| Endpoint                    | Method | Auth | Description               |
| --------------------------- | ------ | ---- | ------------------------- |
| `/api/news`                 | GET    | ✅    | Get personalized news     |
| `/api/news/:id/read`        | POST   | ✅    | Mark article as read      |
| `/api/news/:id/favorite`    | POST   | ✅    | Mark article as favorite  |
| `/api/news/read`            | GET    | ✅    | Get all read articles     |
| `/api/news/favorites`       | GET    | ✅    | Get all favorite articles |
| `/api/news/search/:keyword` | GET    | ✅    | Search news by keyword    |



## Running Tests

```bash
npm run test
```

## Future Improvements

* Rate limiting per user
* Background job for refreshing cache
* Admin dashboard for analytics

---

## License

MIT © 2025 George Joseph


