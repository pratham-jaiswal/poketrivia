import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { GameSession, User } from "@/lib/models";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

export interface Answer {
  questionId: string;
  selected: string;
}

/**
 * POST /api/game/submit
 * Submit answers and calculate score/rewards
 * Body: { sessionId: string, answers: Answer[] }
 */
export const POST = catchAsync(async (req: NextRequest) => {
  const { userId, user } = await validateAuth();
  const { sessionId, answers } = (await req.json()) as {
    sessionId: string;
    answers: Answer[];
  };

  await connect();

  const session = await GameSession.findById(sessionId);
  if (!session) {
    throw new AppError("Game session not found", 404);
  }

  if (session.expiresAt < new Date()) {
    throw new AppError("Session expired", 400);
  }

  if (session.isCompleted) {
    throw new AppError("This session has already been submitted", 400);
  }

  if (session.userId !== userId) {
    throw new AppError(
      "You do not have permission to submit this session",
      403,
    );
  }

  if (!answers || answers.length !== session.questions.length) {
    throw new AppError("Invalid session: answer count mismatch", 403);
  }

  if (Date.now() - new Date(session.createdAt).getTime() < 3000) {
    throw new AppError("Session too recent (minimum 3 seconds)", 429);
  }

  // Calculate score
  let score = 0;
  const map = new Map(answers.map((a) => [a.questionId, a.selected]));

  for (const q of session.questions) {
    if (map.get(q.questionId) === q.correctAnswer) score++;
  }

  // Calculate rewards
  const baseRate = session.type === "image" ? 4 : 2;
  const lengthMultiplier = session.questions.length >= 20 ? 1.2 : 1.0;

  let accuracyBonus = 0;
  const accuracy = score / session.questions.length;

  if (accuracy === 1) {
    accuracyBonus = 20;
  } else if (accuracy >= 0.9) {
    accuracyBonus = 10;
  } else if (accuracy >= 0.8) {
    accuracyBonus = 5;
  }

  let xp = Math.floor(
    score * (session.type === "image" ? 2 : 1) * lengthMultiplier,
  );
  xp = Math.max(0, xp);

  let coins = Math.floor(score * baseRate * lengthMultiplier + accuracyBonus);
  coins = Math.max(0, coins);

  // Calculate daily bonus
  const now = new Date();
  const today = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const lastBonusDate = new Date(user.lastDailyBonus);
  const lastBonusDay = new Date(
    lastBonusDate.getFullYear(),
    lastBonusDate.getMonth(),
    lastBonusDate.getDate(),
  ).getTime();

  let loginStreak = user.loginStreak || 0;
  let dailyBonus = 0;
  if (today > lastBonusDay) {
    const yesterday = today - 86400000;
    loginStreak = lastBonusDay === yesterday ? loginStreak + 1 : 1;
    user.loginStreak = loginStreak;
    dailyBonus = Math.min(50 + loginStreak * 5, 150);
    user.lastDailyBonus = now;
  }

  // Prevent integer overflow
  const maxLimit = 2 ** 31 - 1;
  const currentCoins = user.pokecoins || 0;
  const roomLeft = Math.max(0, maxLimit - currentCoins);
  const actualCoinsAdded = Math.min(coins, roomLeft);

  const roomAfterCoins = Math.max(0, roomLeft - actualCoinsAdded);
  const actualBonusAdded = Math.min(dailyBonus, roomAfterCoins);

  const coinsToAdd = actualCoinsAdded + actualBonusAdded;
  const xpToAdd = Math.min(xp, Math.max(0, maxLimit - (user.totalScore || 0)));

  // Update session as completed
  session.attemptedAt = new Date();
  session.isCompleted = true;
  await session.save();

  // Update user with rewards
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      $inc: { totalScore: xpToAdd, pokecoins: coinsToAdd },
      $set: {
        lastDailyBonus: user.lastDailyBonus,
        loginStreak,
      },
    },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new AppError("User account not found", 404);
  }

  return NextResponse.json({
    score,
    rewards: {
      xp: xpToAdd,
      coins: actualCoinsAdded,
      dailyBonus: actualBonusAdded,
    },
    streak: user.loginStreak,
    user: updatedUser,
  });
});
