import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  // Protect everything except login, ALL api routes, and static files.
  // API routes must manually check session and return 401 JSON instead of redirecting.
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
