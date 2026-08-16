import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

/**
 * Registration happens directly against the backend (not through NextAuth,
 * which only handles login/session). On success the caller signs the user
 * in via next-auth's credentials provider using the same email/password.
 */
export async function registerAccount(name: string, email: string, password: string) {
  console.log("[auth] registering", email);
  const res = await axios.post(`${BACKEND_URL}/api/auth/register`, { name, email, password });
  if (!res.data.success) {
    throw new Error(res.data.error || "Registration failed");
  }
  return res.data.data as { user: { id: string; email: string; name: string }; token: string };
}
