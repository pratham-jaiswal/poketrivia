import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";

export async function GET(req: Request) {
  try {
    // Try to resolve session with the request context
    // @ts-ignore
    const session = await auth0.getSession(req).catch(() => null);

    const cookieHeader = (req.headers.get("cookie") || "") as string;
    const headers: Record<string, string> = {};
    for (const [k, v] of req.headers) headers[k] = v;

    return NextResponse.json({
      ok: true,
      session: session || null,
      cookies: cookieHeader,
      headers,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 },
    );
  }
}
