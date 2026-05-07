import bcrypt from 'bcrypt';
import { SALT_ROUNDS } from '../constants/constants.js';

/**
 * Hash a plaintext password.
 * @param {string} plaintext
 * @returns {Promise<string>} bcrypt hash
 */
const hashPassword = (plaintext) => bcrypt.hash(plaintext, SALT_ROUNDS);

/**
 * Compare a plaintext password against a bcrypt hash.
 * @param {string} plaintext
 * @param {string} hash
 * @returns {Promise<boolean>}
 */
const comparePassword = (plaintext, hash) => bcrypt.compare(plaintext, hash);

export { hashPassword, comparePassword };
