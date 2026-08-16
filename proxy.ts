import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAppConfig } from "./lib/config";
import { auth0 } from "./lib/auth0";

validateAppConfig();

const protectedRoutes = [
  "/profile",
  "/trivia",
];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Let Auth0 handle its own routes
  if (pathname.startsWith("/auth/")) {
    return await auth0.middleware(req);
  }

  // Check whether this is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) =>
      pathname === route ||
      pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    const session = await auth0.getSession();

    if (!session) {
      const loginUrl = new URL("/auth/login", req.url);

      // Send the user back here after login
      loginUrl.searchParams.set("returnTo", pathname);

      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/auth/:path*",
    "/profile/:path*",
    "/trivia/:path*",
  ],
};