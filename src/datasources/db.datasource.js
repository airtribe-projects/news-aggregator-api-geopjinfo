import mongoose from 'mongoose';
import env from '../config/env.js';

// ── Connection helpers ──────────────────────────────────────────────────────
const connectDatabase = async () => mongoose.connect(env.MONGODB_URI);
const disconnectDatabase = async () => mongoose.disconnect();
const pingDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    return false;
  }

  await mongoose.connection.db.admin().ping();
  return true;
};

// ── Generic CRUD helpers ────────────────────────────────────────────────────
// Each function receives the Mongoose Model as the first argument so the
// datasource stays model-agnostic and contains no domain decisions.

const findOne = (Model, query, options = {}) =>
  Model.findOne(query, options.projection ?? null);

const findMany = async (Model, query, options = {}) => {
  const { sort, skip, limit, projection } = options;
  let q = Model.find(query, projection ?? null);
  if (sort) q = q.sort(sort);
  if (skip != null) q = q.skip(skip);
  if (limit != null) q = q.limit(limit);
  return q;
};

const findById = (Model, id, options = {}) =>
  Model.findById(id, options.projection ?? null);

const create = (Model, data) => Model.create(data);

const updateOne = (Model, query, update, options = {}) =>
  Model.findOneAndUpdate(query, update, { new: true, runValidators: true, ...options });

const deleteOne = (Model, query) => Model.deleteOne(query);

const exists = (Model, query) => Model.exists(query);

export {
  connectDatabase,
  disconnectDatabase,
  pingDatabase,
  findOne,
  findMany,
  findById,
  create,
  updateOne,
  deleteOne,
  exists,
};
