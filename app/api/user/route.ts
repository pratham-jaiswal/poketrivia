import { NextResponse } from "next/server";
import { validateAuth } from "@/lib/authMiddleware";
import { catchAsync } from "@/lib/catchAsync";

/**
 * GET /api/user
 * Returns authenticated user's profile
 */
export const GET = catchAsync(async () => {
  const { user } = await validateAuth();

  const totalOwned = Array.isArray(user.pokemons) ? user.pokemons.length : 0;

  const safeUser = {
    id: user._id.toString(),
    username: user.username,
    email: user.email,
    totalScore: user.totalScore ?? 0,
    pokecoins: user.pokecoins ?? 0,
    totalOwned,
    loginStreak: user.loginStreak ?? 0,
    createdAt: user.createdAt?.toISOString(),
    lastDailyBonus: user.lastDailyBonus?.toISOString(),
  };

  return NextResponse.json({ user: safeUser });
});
