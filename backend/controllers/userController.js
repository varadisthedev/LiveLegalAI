const userService = require('../services/userService');
const { formatResponse } = require('../utils/responseFormatter');

/**
 * GET /api/user/profile
 */
const getUserProfile = async (req, res, next) => {
  try {
    const profile = await userService.getUserProfile(req.userId);
    return res.status(200).json(formatResponse(true, profile));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserProfile,
};
