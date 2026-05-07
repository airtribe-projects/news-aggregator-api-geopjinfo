import mongoose from 'mongoose';

const articleInteractionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    articleId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    url: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      enum: ['read', 'favorite'],
      required: true,
    },
    articleSnapshot: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    interactedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true, versionKey: false }
);

articleInteractionSchema.index({ userId: 1, articleId: 1, type: 1 }, { unique: true });
articleInteractionSchema.index({ userId: 1, type: 1 });

export default mongoose.model('ArticleInteraction', articleInteractionSchema);
