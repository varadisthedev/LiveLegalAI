const authService = require("../services/authService");
const { formatResponse } = require("../utils/responseFormatter");

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    return res.status(201).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const result = await authService.login(req.body);
    return res.status(200).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/google
 */
const googleAuth = async (req, res, next) => {
  try {
    const result = await authService.googleAuth(req.body);
    return res.status(200).json(formatResponse(true, result));
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.userId);
    return res.status(200).json(formatResponse(true, user));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
};
