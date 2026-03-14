const { formatResponse } = require('../utils/responseFormatter');

const validateChat = (req, res, next) => {
  if (!req.body.question) {
    return res.status(400).json(formatResponse(false, null, "Question is required."));
  }
  
  if (req.body.responseStyle && !['brief', 'detailed', 'bullet_points'].includes(req.body.responseStyle)) {
    return res.status(400).json(formatResponse(false, null, "Invalid response style. Must be 'brief', 'detailed', or 'bullet_points'."));
  }

  next();
};

module.exports = {
  validateChat
};
