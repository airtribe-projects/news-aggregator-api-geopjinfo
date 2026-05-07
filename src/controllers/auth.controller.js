import authService from '../services/auth.service.js';
import { sendSuccess } from '../utils/response.js';

const register = async (req, res) => {
  const user = await authService.register(req.body);
  sendSuccess(res, user, 201, {}, 'User registered successfully');
};

const login = async (req, res) => {
  const result = await authService.login(req.body);
  sendSuccess(res, { user: result.user, token: result.token });
};

export default {
  register,
  login,
};
