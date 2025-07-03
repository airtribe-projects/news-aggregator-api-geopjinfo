const express = require('express');
const router = express.Router();
const preferencesController = require('../controllers/preferences.controller');
const authenticateToken = require('../middlewares/auth.middleware');

// Protected routes
router.get('/preferences', authenticateToken, preferencesController.getPreferences);
router.put('/preferences', authenticateToken, preferencesController.updatePreferences);

module.exports = router;
