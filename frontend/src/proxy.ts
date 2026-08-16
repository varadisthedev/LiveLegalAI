// Next.js 16 renamed "Middleware" to "Proxy" (same runtime semantics — a
// request-scoped function that can redirect/rewrite before the route runs).
// This still uses next-auth's withAuth() helper, which works unchanged.
import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/upload/:path*",
    "/history/:path*",
    "/settings/:path*",
    "/analysis/:path*",
    "/chat/:path*",
  ],
};
