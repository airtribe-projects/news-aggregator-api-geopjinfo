import ApiError from '../utils/ApiError.js';
import { ERROR_CODES } from '../constants/constants.js';
import userRepository from '../repositories/user.repository.js';
import { generateToken } from '../utils/jwt.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const register = async (userData) => {
  const { name, email, password } = userData;

  // Check if email already exists using dedicated method
  const emailExists = await userRepository.existsByEmail(email);
  if (emailExists) {
    throw new ApiError(ERROR_CODES.EMAIL_ALREADY_REGISTERED);
  }

  const hashedPassword = await hashPassword(password);
  const user = await userRepository.create({ name, email, password: hashedPassword });
  return user;
};

const login = async (credentials) => {
  const { email, password } = credentials;

  if (!email || !password) {
    throw new ApiError(ERROR_CODES.VALIDATION_ERROR, { message: 'Email and password are required' });
  }

  // Fetch user including password field (select:false on schema requires this)
  const user = await userRepository.findByEmailWithPassword(email);
  if (!user) {
    throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await comparePassword(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(ERROR_CODES.INVALID_CREDENTIALS);
  }

  const token = generateToken({ userId: user._id });

  return {
    user: userRepository.mapToDTO(user),
    token,
  };
};

export default {
  register,
  login,
};
