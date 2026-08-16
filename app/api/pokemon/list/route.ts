import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { Pokemon } from "@/lib/models";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * GET /api/pokemon/pokemons?offset=0&limit=20&view=all&category=all
 * Get Pokemon list with owned status (requires authentication)
 * view: "all" | "owned"
 * category: "all" | "legendary" | "mythical"
 */
export const GET = catchAsync(async (req: NextRequest) => {
  // Try to validate auth; if user not found or not authenticated,
  // allow anonymous access for `view=all` but disallow `view=owned`.
  let user: any = null;
  try {
    const auth = await validateAuth();
    user = auth.user;
  } catch (err: any) {
    if (
      err instanceof AppError &&
      (err.statusCode === 401 || err.statusCode === 404)
    ) {
      user = null;
    } else {
      throw err;
    }
  }

  const url = new URL(req.url);
  const offset = Math.max(
    parseInt(url.searchParams.get("offset") || "0", 10),
    0,
  );
  const limit = Math.min(
    parseInt(url.searchParams.get("limit") || "20", 10),
    100,
  );
  const view = url.searchParams.get("view") || "all";
  const category = url.searchParams.get("category") || "all";

  if (!["all", "owned"].includes(view)) {
    throw new AppError("Invalid view parameter", 400);
  }

  if (!["all", "legendary", "mythical"].includes(category)) {
    throw new AppError("Invalid category parameter", 400);
  }

  await connect();

  let query: any = {};
  if (category === "legendary") query.isLegendary = true;
  if (category === "mythical") query.isMythical = true;

  const ownedIds = user
    ? user.pokemons.map((p: any) => p.pokemon.toString())
    : [];
  const ownedSet = new Set(ownedIds);

  if (view === "owned") {
    if (!user) throw new AppError("Authentication required", 401);
    query._id = { $in: ownedIds };
  }

  const [pokemons, total] = await Promise.all([
    Pokemon.find(query, { backSpriteUrl: 0, facts: 0 })
      .sort({ id: 1 })
      .skip(offset * limit)
      .limit(limit)
      .lean(),
    Pokemon.countDocuments(query),
  ]);

  const enriched = pokemons.map((p: any) => {
    const isOwned = ownedSet.has(p._id.toString());

    if (!isOwned) {
      return {
        _id: p._id,
        id: p.id,
        silhouetteData: p.silhouetteData,
        isOwned: false,
      };
    }

    return { ...p, isOwned: true };
  });

  return NextResponse.json({
    data: enriched,
    pagination: {
      total,
      offset,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: (offset + 1) * limit < total,
      hasPrev: offset > 0,
    },
  });
});
