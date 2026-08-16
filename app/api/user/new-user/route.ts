import { NextRequest, NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { connect } from "@/lib/mongoose";
import { User } from "@/lib/models";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * POST /api/user/new-user
 * Create a new user account after Auth0 signup
 */
export const POST = catchAsync(async (req: NextRequest) => {
  const session = await auth0.getSession();

  if (!session?.user?.email) {
    throw new AppError("Authentication required", 401);
  }

  const { username } = (await req.json()) as { username: string };

  if (!username || username.trim().length === 0) {
    throw new AppError("Username is required", 400);
  }

  await connect();

  // Check if username already exists
  const existing = await User.findOne({ username });
  if (existing) {
    throw new AppError("Username taken", 400);
  }

  // Check if user already exists with this email
  const emailExists = await User.findOne({ email: session.user.email });
  if (emailExists) {
    throw new AppError("User already exists", 400);
  }

  const user = await User.create({
    username,
    email: session.user.email,
    pokemons: [],
    totalScore: 0,
    pokecoins: 0,
    lastDailyBonus: new Date(),
    loginStreak: 0,
  });

  return NextResponse.json({ user }, { status: 201 });
});
