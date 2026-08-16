import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { validateAppConfig } from "./lib/config";
import { auth0 } from "./lib/auth0";

// Validate all configuration on startup
validateAppConfig();

export async function proxy(req: NextRequest) {
  const url = req.nextUrl.clone();
  const pathname = url.pathname;

  if (pathname.startsWith("/auth/")) {
    return await auth0.middleware(req);
  }

  // Protect only the /pokedex route (and its subpaths)
  if (pathname.startsWith("/pokedex")) {
    // Prefer resolving a server session directly when possible. Some login flows
    // (e.g. auth performed by the server) will have a valid session even when
    // specific cookie names aren't present on the request. Try `auth0.getSession`
    // and only fall back to cookie-based heuristics if that API is not available
    // or throws.
    try {
      // auth0.getSession may accept the Request/NextRequest in newer SDKs;
      // attempt to resolve it and treat a non-null session as authenticated.
      // If the method doesn't accept args it will likely ignore them.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const session = await auth0.getSession(req);
      if (session && session.user) {
        return NextResponse.next();
      }
    } catch (err) {
      // ignore and fall back to cookie check below
    }

    const cookies = req.cookies;
    const specific =
      cookies.get("appSession") ||
      cookies.get("auth0.is.authenticated") ||
      cookies.get("a0:session");

    // Fallback: inspect raw cookie header for any likely auth/session cookie names
    const cookieHeader = req.headers.get("cookie") || "";
    const broadMatch =
      /(?:^|;\s*)(?:__?host)?(?:app|auth|a0|session|auth0)[^=]*/i.test(
        cookieHeader,
      );

    const hasAuthCookie = !!specific || broadMatch;

    if (!hasAuthCookie) {
      url.pathname = "/auth/login";
      url.searchParams.set("returnTo", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/auth/:path*", "/pokedex/:path*"],
};
