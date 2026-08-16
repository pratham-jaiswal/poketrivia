import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { User } from "@/lib/models";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * POST /api/user/visited
 * Mark that user has visited a section (PlayModes, PokemonNursery, etc)
 * Body: { field: 'visitedPlayModes' | 'visitedPokemonNursery' }
 */
export const POST = catchAsync(async (req: NextRequest) => {
  const { userId } = await validateAuth();
  const { field } = (await req.json()) as { field: string };

  // Whitelist allowed fields
  const allowedFields = ["visitedPlayModes", "visitedPokemonNursery"];

  if (!allowedFields.includes(field)) {
    throw new AppError("Invalid field", 400);
  }

  await connect();

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: { [field]: true } },
    { returnDocument: "after" },
  );

  if (!updatedUser) {
    throw new AppError("User account not found", 404);
  }

  return NextResponse.json({ user: updatedUser });
});
