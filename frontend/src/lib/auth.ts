import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

type BackendAuthPayload = {
  user: {
    id: string;
    email: string;
    name: string;
    provider: "credentials" | "google";
    avatarUrl: string;
  };
  token: string;
};

/**
 * Every login path (credentials or Google) funnels through this — the Express
 * backend is the single source of truth for the JWT that authorizes API calls.
 */
async function exchangeWithBackend(
  path: "/api/auth/login" | "/api/auth/register" | "/api/auth/google",
  body: Record<string, string>,
): Promise<BackendAuthPayload | null> {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const json = await res.json();
    console.log(`[auth] ${path} ->`, res.status, json.success);
    if (!res.ok || !json.success) return null;
    return json.data as BackendAuthPayload;
  } catch (err) {
    console.error(`[auth] ${path} failed:`, err);
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const result = await exchangeWithBackend("/api/auth/login", {
          email: credentials.email,
          password: credentials.password,
        });
        if (!result) return null;

        return {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          image: result.user.avatarUrl,
          backendToken: result.token,
          provider: result.user.provider,
        };
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ account, user }) {
      if (account?.provider === "google" && account.id_token) {
        const result = await exchangeWithBackend("/api/auth/google", {
          idToken: account.id_token,
        });
        if (!result) return false;

        // Stash the backend's response on the user object so it's visible
        // to the jwt() callback that fires immediately after this.
        user.id = result.user.id;
        (user as { backendToken?: string }).backendToken = result.token;
        (user as { provider?: string }).provider = result.user.provider;
      }
      return true;
    },
    async jwt({ token, user }) {
      // Overriding jwt() disables NextAuth's default field merge, so the
      // basic profile fields have to be carried over explicitly here too.
      if (user) {
        token.userId = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
        token.backendToken = (user as { backendToken?: string }).backendToken;
        token.provider = (user as { provider?: string }).provider;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string;
      }
      session.backendToken = token.backendToken as string;
      session.provider = token.provider as string;
      return session;
    },
  },
};
