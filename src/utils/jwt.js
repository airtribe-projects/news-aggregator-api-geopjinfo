import jwt from 'jsonwebtoken';
import env from '../config/env.js';

/**
 * Sign a payload and return a JWT token.
 * @param {object} payload - Data to encode (e.g. { userId })
 * @returns {string} Signed JWT
 */
const generateToken = (payload) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

/**
 * Verify a JWT token and return the decoded payload.
 * Throws a JsonWebTokenError / TokenExpiredError on failure.
 * @param {string} token
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => jwt.verify(token, env.JWT_SECRET);

export { generateToken, verifyToken };
