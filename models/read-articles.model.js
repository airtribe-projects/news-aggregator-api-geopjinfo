const mongoose = require('mongoose');

const readArticleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  articleId: {
    type: String, // external ID or URL
    required: true,
  },
  title: String,
  url: String,
  readAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('ReadArticle', readArticleSchema);
