import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { Pokemon } from "@/lib/models";
import { catchAsync } from "@/lib/catchAsync";

/**
 * GET /api/pokemon/search?q=searchterm
 * Search for Pokemon by name (requires authentication)
 */
export const GET = catchAsync(async (req: NextRequest) => {
  // Validate authentication
  await validateAuth();

  const url = new URL(req.url);
  const q = url.searchParams.get("q") || "";

  if (!q || q.trim().length === 0) {
    return NextResponse.json({ results: [] });
  }

  await connect();

  const regex = new RegExp(q.trim(), "i");
  const docs = await Pokemon.find({ name: regex })
    .limit(20)
    .select("name frontSpriteUrl id");

  const results = docs.map((d: any) => ({
    name: d.name,
    frontSpriteUrl: d.frontSpriteUrl,
    id: d.id,
  }));

  return NextResponse.json({ results });
});
