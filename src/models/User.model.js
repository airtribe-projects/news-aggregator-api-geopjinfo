import mongoose from 'mongoose';
import { DEFAULT_LANGUAGE, DEFAULT_COUNTRY } from '../constants/constants.js';

export const defaultPreferences = {
  categories: [],
  languages: [DEFAULT_LANGUAGE],
  country: DEFAULT_COUNTRY,
  keywords: [],
  sources: [],
};

const preferencesSchema = new mongoose.Schema(
  {
    categories: { type: [String], default: [] },
    languages:  { type: [String], default: [DEFAULT_LANGUAGE] },
    country:    { type: String,   default: DEFAULT_COUNTRY, trim: true },
    keywords:   { type: [String], default: [] },
    sources:    { type: [String], default: [] },
  },
  { _id: false, versionKey: false }
);

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^\S+@\S+\.\S+$/,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  preferences: {
    type: preferencesSchema,
    default: () => ({ ...defaultPreferences }),
  },
}, { timestamps: true, versionKey: false });

const User = mongoose.model('User', userSchema);
export default User;
