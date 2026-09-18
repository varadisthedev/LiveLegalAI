const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
const {
  findUserByEmail,
  findUserById,
  findUserByGoogleIdOrEmail,
  createUser,
  linkGoogleAccount,
} = require("../repositories/userRepository");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const signToken = (userId) =>
  jwt.sign({ sub: String(userId) }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const toPublicUser = (user) => ({
  id: String(user._id),
  email: user.email,
  name: user.name,
  provider: user.provider,
  avatarUrl: user.avatarUrl || "",
  createdAt: user.createdAt,
});

const register = async ({ name, email, password }) => {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError("An account with this email already exists.", 409);
  }

  const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  const passwordHash = await bcrypt.hash(password, saltRounds);

  const user = await createUser({ name, email, passwordHash, provider: "credentials" });
  const token = signToken(user._id);
  logger.info(`New user registered: ${user.email}`);

  return { user: toPublicUser(user), token };
};

const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    throw new AppError("Invalid email or password.", 401);
  }

  if (!user.passwordHash) {
    throw new AppError(
      "This account uses Google sign-in. Please continue with Google.",
      400,
    );
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError("Invalid email or password.", 401);
  }

  const token = signToken(user._id);
  logger.info(`User logged in: ${user.email}`);

  return { user: toPublicUser(user), token };
};

/**
 * Verifies a Google ID token server-side and finds-or-creates the matching user.
 */
const googleAuth = async ({ idToken }) => {
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    payload = ticket.getPayload();
  } catch (err) {
    logger.warn(`Google idToken verification failed: ${err.message}`);
    throw new AppError("Invalid Google credential.", 401);
  }

  const { sub: googleId, email, name, picture } = payload;
  if (!email) {
    throw new AppError("Google account has no email.", 400);
  }

  let user = await findUserByGoogleIdOrEmail(googleId, email);

  if (!user) {
    user = await createUser({
      name: name || email.split("@")[0],
      email,
      provider: "google",
      googleId,
      avatarUrl: picture || "",
    });
    logger.info(`New Google user created: ${user.email}`);
  } else if (!user.googleId) {
    // Existing credentials account signing in with Google for the first time
    user = await linkGoogleAccount(user, googleId, picture);
    logger.info(`Linked Google identity to existing account: ${user.email}`);
  }

  const token = signToken(user._id);
  return { user: toPublicUser(user), token };
};

const getMe = async (userId) => {
  const user = await findUserById(userId);
  if (!user) {
    throw new AppError("User not found.", 404);
  }
  return toPublicUser(user);
};

module.exports = {
  register,
  login,
  googleAuth,
  getMe,
};
