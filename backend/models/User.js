const mongoose = require("mongoose");

/**
 * User Model — MongoDB
 *
 * Backs both credentials (email/password) and Google OAuth accounts.
 * `passwordHash` is null for Google-only accounts. If a Google sign-in
 * matches an existing credentials account by email, `googleId` is attached
 * to that same document so the user isn't locked out of either method.
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    provider: {
      type: String,
      enum: ["credentials", "google"],
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

module.exports = User;
