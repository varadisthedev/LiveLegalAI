const User = require('../models/User');

const findUserByEmail = async (email) => User.findOne({ email });

const findUserById = async (id) => User.findById(id);

const findUserByGoogleIdOrEmail = async (googleId, email) =>
  User.findOne({ $or: [{ googleId }, { email }] });

const createUser = async (userData) => User.create(userData);

/**
 * Attaches a Google identity to an existing credentials account so the
 * user isn't locked out of either sign-in method.
 */
const linkGoogleAccount = async (user, googleId, avatarUrl) => {
  user.googleId = googleId;
  if (avatarUrl && !user.avatarUrl) user.avatarUrl = avatarUrl;
  await user.save();
  return user;
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByGoogleIdOrEmail,
  createUser,
  linkGoogleAccount,
};
