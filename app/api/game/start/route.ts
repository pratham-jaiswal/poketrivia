import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { GameSession } from "@/lib/models";
import {
  generateFactQuiz,
  generateScrambleQuiz,
  generateImageQuiz,
} from "@/lib/game_utils";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * POST /api/game/start
 * Start a new game session
 * Body: { type: 'fact' | 'scramble' | 'image' }
 */
export const POST = catchAsync(async (req: NextRequest) => {
  const { userId } = await validateAuth();
  const { type } = (await req.json()) as { type: string };

  if (!["fact", "scramble", "image"].includes(type)) {
    throw new AppError("Invalid game type", 400);
  }

  await connect();

  // Check for recent session (rate limiting)
  const recent = await GameSession.findOne({
    userId,
    createdAt: { $gt: new Date(Date.now() - 30000) }, // 30s
  });

  if (recent) {
    const cooldownMs = 30000;
    const elapsedMs = Date.now() - new Date(recent.createdAt).getTime();
    const remainingSeconds = Math.max(
      1,
      Math.ceil((cooldownMs - elapsedMs) / 1000),
    );

    throw new AppError(
      `Please wait ${remainingSeconds} second${remainingSeconds === 1 ? "" : "s"} before starting another round.`,
      429,
      { code: "SESSION_COOLDOWN", cooldownSecondsRemaining: remainingSeconds },
    );
  }

  // Mark incomplete sessions as completed
  await GameSession.updateMany(
    { userId, isCompleted: false },
    { $set: { isCompleted: true } },
  );

  const questions =
    type === "fact"
      ? await generateFactQuiz()
      : type === "scramble"
        ? await generateScrambleQuiz()
        : await generateImageQuiz();

  if (questions.length === 0) {
    throw new AppError("No questions available right now", 404);
  }

  const session = await GameSession.create({
    userId,
    type,
    questions: questions.map((q: any) => ({
      questionId: q.questionId,
      correctAnswer: q.correctAnswer,
    })),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 60 mins
  });

  return NextResponse.json(
    {
      sessionId: session._id,
      questions: questions.map((q: any) => ({
        questionId: q.questionId,
        question: q.question,
        options: q.options,
      })),
    },
    { status: 200 },
  );
});
