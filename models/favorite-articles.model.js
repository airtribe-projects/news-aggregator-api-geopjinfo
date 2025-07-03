const mongoose = require('mongoose');

const favoriteArticleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  articleId: {
    type: String,
    required: true,
  },
  title: String,
  url: String,
  favoritedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('FavoriteArticle', favoriteArticleSchema);
