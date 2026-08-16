import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import {
  generateFactQuiz,
  generateScrambleQuiz,
  generateImageQuiz,
} from "@/lib/game_utils";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * GET /api/pokemon/quiz?type=fact|scramble|image&count=10
 * Returns quiz questions (requires authentication)
 */
export const GET = catchAsync(async (req: NextRequest) => {
  // Validate authentication
  await validateAuth();

  const url = new URL(req.url);
  const type = url.searchParams.get("type") || "fact";
  const count = parseInt(url.searchParams.get("count") || "10", 10);

  if (!["fact", "scramble", "image"].includes(type)) {
    throw new AppError("Invalid game type", 400);
  }

  if (count < 1 || count > 50) {
    throw new AppError("Count must be between 1 and 50", 400);
  }

  await connect();

  let payload;
  if (type === "scramble") {
    payload = await generateScrambleQuiz(count);
  } else if (type === "image") {
    payload = await generateImageQuiz(count);
  } else {
    payload = await generateFactQuiz(count);
  }

  return NextResponse.json({ questions: payload });
});
