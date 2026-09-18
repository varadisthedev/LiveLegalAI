const { body, validationResult } = require("express-validator");
const { formatResponse } = require("../utils/responseFormatter");

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json(formatResponse(false, null, errors.array()[0].msg));
  }
  next();
};

const validateRegister = [
  body("name").trim().notEmpty().withMessage("Name is required."),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters."),
  handleValidation,
];

const validateLogin = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
  handleValidation,
];

const validateGoogleAuth = [
  body("idToken").notEmpty().withMessage("Google idToken is required."),
  handleValidation,
];

module.exports = {
  validateRegister,
  validateLogin,
  validateGoogleAuth,
};
