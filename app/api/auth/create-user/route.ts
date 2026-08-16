import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connect } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { AppError } from "@/lib/appError";

/**
 * POST /api/auth/create-user
 * Creates a User document for the current Auth0 session if one doesn't exist.
 * Returns the user document.
 */
export async function POST(req: NextRequest) {
  try {
    // Resolve session using request context
    // @ts-ignore
    const session = await auth0.getSession(req).catch(() => null);

    if (!session?.user?.email) {
      return NextResponse.json(
        { status: "error", message: "Authentication required" },
        { status: 401 },
      );
    }
    await connect();

    const email = session.user.email;
    const username =
      session.user.name || session.user.nickname || email.split("@")[0];

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username,
        email,
        pokemons: [],
      });
    }

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    console.error("create-user error", err);
    const message = err?.message || "Internal Server Error";
    const status = err instanceof AppError ? err.statusCode : 500;
    return NextResponse.json({ status: "error", message }, { status });
  }
}
