import ArticleInteraction from '../models/ArticleInteraction.model.js';
import * as dbDataSource from '../datasources/db.datasource.js';

const mapToDTO = (item) => {
  if (!item) return null;
  return {
    id: item._id.toString(),
    userId: item.userId.toString(),
    articleId: item.articleId,
    title: item.title,
    url: item.url,
    articleSnapshot: item.articleSnapshot ?? null,
    type: item.type,
    interactedAt: item.interactedAt,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const create = async (userId, articleData, type) => {
  const { articleId, title, url, ...rest } = articleData;
  const interaction = await dbDataSource.create(ArticleInteraction, {
    userId,
    articleId,
    title,
    url,
    type,
    articleSnapshot: { title, url, ...rest },
    interactedAt: new Date(),
  });
  return mapToDTO(interaction);
};

const findByUserIdAndArticleId = async (userId, articleId, type) => {
  const item = await dbDataSource.findOne(ArticleInteraction, { userId, articleId, type });
  return item ? mapToDTO(item) : null;
};

const upsertInteraction = async (userId, articleData, type) => {
  const existing = await dbDataSource.findOne(ArticleInteraction, {
    userId,
    articleId: articleData.articleId,
    type,
  });
  if (existing) {
    existing.interactedAt = new Date();
    await existing.save();
    return mapToDTO(existing);
  }
  return create(userId, articleData, type);
};

const markAsRead = async (userId, articleData) => upsertInteraction(userId, articleData, 'read');

const markAsFavorite = async (userId, articleData) => upsertInteraction(userId, articleData, 'favorite');

const findByType = async (userId, type, options = {}) => {
  const { limit = 50, skip = 0 } = options;
  const items = await dbDataSource.findMany(ArticleInteraction, { userId, type }, {
    sort: { interactedAt: -1 },
    skip,
    limit,
  });
  return items.map((item) => mapToDTO(item));
};

const findReadByUserId = async (userId, options = {}) => findByType(userId, 'read', options);

const findFavoritesByUserId = async (userId, options = {}) => findByType(userId, 'favorite', options);

export default {
  create,
  findByUserIdAndArticleId,
  markAsRead,
  markAsFavorite,
  findReadByUserId,
  findFavoritesByUserId,
  upsertInteraction,
  findByType,
  mapToDTO,
};
