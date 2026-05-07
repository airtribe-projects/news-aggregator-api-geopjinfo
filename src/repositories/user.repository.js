import User from '../models/User.model.js';
import * as dbDataSource from '../datasources/db.datasource.js';
import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/constants.js';

const mapToDTO = (user) => {
  if (!user) return null;
  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    preferences: user.preferences ?? null,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const create = async (userData) => {
  try {
    const user = await dbDataSource.create(User, userData);
    return mapToDTO(user);
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(ERROR_CODES.EMAIL_ALREADY_REGISTERED);
    }
    throw err;
  }
};

const findById = async (userId) => {
  const user = await dbDataSource.findById(User, userId);
  return user ? mapToDTO(user) : null;
};

const findByEmail = async (email) => {
  const user = await dbDataSource.findOne(User, { email });
  return user ? mapToDTO(user) : null;
};

const findByEmailWithPassword = async (email) => {
  return User.findOne({ email }).select('+password');
};

const existsByEmail = async (email) => !!(await dbDataSource.exists(User, { email }));

const updatePreferences = async (userId, preferences) => {
  const user = await dbDataSource.updateOne(User, { _id: userId }, { preferences });
  return user ? mapToDTO(user) : null;
};

const getPreferences = async (userId) => {
  const user = await dbDataSource.findById(User, userId);
  return user ? user.preferences ?? null : null;
};

const findAll = async () => {
  const users = await dbDataSource.findMany(User, {});
  return users.map(mapToDTO);
};

export default {
  create,
  findById,
  findByEmail,
  findByEmailWithPassword,
  existsByEmail,
  updatePreferences,
  getPreferences,
  findAll,
  mapToDTO,
};
  