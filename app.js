const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth.routes');
const preferencesRoutes = require('./routes/preferences.routes');
const newsRoutes = require('./routes/news.routes');
const errorHandler = require('./utils/custom-error');

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// Routes
app.use('/users', authRoutes);
app.use('/users', preferencesRoutes);
app.use('/news', newsRoutes);

// Health check
app.get('/', (req, res) => res.send('News Aggregator API is running'));

// Global error handler
app.use(errorHandler);

module.exports = app;
