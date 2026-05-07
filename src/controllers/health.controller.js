import healthService from '../services/health.service.js';
import { sendSuccess } from '../utils/response.js';

const getHealth = async (req, res) => {
  const result = await healthService.check();
  return sendSuccess(res, result);
};

export default {
  getHealth,
};
