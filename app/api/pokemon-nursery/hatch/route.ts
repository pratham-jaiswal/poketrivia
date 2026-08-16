import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { User, Pokemon, EggPricing } from "@/lib/models";
import { calculateFinalPrice } from "@/lib/pricingUtil";
import { AppError } from "@/lib/appError";
import { catchAsync } from "@/lib/catchAsync";

/**
 * POST /api/pokemon-nursery/hatch
 * Hatch an egg (purchase and get random Pokemon)
 * Body: { mode: string, clientPrice: number }
 */
export const POST = catchAsync(async (req: NextRequest) => {
  const { userId, user } = await validateAuth();
  const { mode, clientPrice } = (await req.json()) as {
    mode: string;
    clientPrice: number;
  };

  if (!user) {
    throw new AppError("User account not found", 404);
  }

  await connect();

  // Get egg pricing
  const eggsData = await EggPricing.findOne({
    mode,
    isActive: true,
  }).lean();

  if (!eggsData) {
    throw new AppError("Selected item is currently unavailable", 400);
  }

  const { finalPrice } = calculateFinalPrice(eggsData as any);
  const hatchCount = Math.max(1, eggsData.quantity ?? 1);

  // Verify price hasn't changed (prevents race conditions)
  if (clientPrice !== finalPrice) {
    const error = new AppError(
      "Price has updated. Please review before hatching.",
      409,
    );
    (error as any).extraData = { newPrice: finalPrice, code: "PRICE_MISMATCH" };
    throw error;
  }

  if (user.pokecoins < finalPrice) {
    throw new AppError("You do not have enough Pokecoins for that egg.", 400, {
      code: "INSUFFICIENT_COINS",
      required: finalPrice,
      current: user.pokecoins,
    });
  }

  // Get pool of available Pokemon for this category
  const poolQuery: any = {
    isLegendary: eggsData.category === "legendary",
    isMythical: eggsData.category === "mythical",
  };

  const ownedIds = user.pokemons.map((p: any) => p.pokemon);
  const availableCount = await Pokemon.countDocuments({
    ...poolQuery,
    _id: { $nin: ownedIds },
  });

  if (availableCount < hatchCount) {
    throw new AppError(
      "Not enough Pokémon remain in this Nursery category",
      400,
      {
        code: "NO_AVAILABLE_POKEMON",
        available: availableCount,
        requested: hatchCount,
      },
    );
  }

  // Use MongoDB aggregation to randomly select Pokemon
  const selected = await Pokemon.aggregate([
    {
      $match: {
        ...poolQuery,
        _id: { $nin: ownedIds },
      },
    },
    {
      $sample: { size: hatchCount },
    },
    {
      $project: { _id: 1, id: 1, name: 1, types: 1, frontSpriteUrl: 1 },
    },
  ]);

  if (!selected || selected.length === 0) {
    throw new AppError("No available Pokemon in this category", 400, {
      code: "NO_AVAILABLE_POKEMON",
    });
  }

  // Deduct coins and add Pokemon
  const updateResult = await User.updateOne(
    { _id: userId, pokecoins: { $gte: finalPrice } },
    {
      $inc: { pokecoins: -finalPrice },
      $push: {
        pokemons: {
          $each: selected.map((pokemon) => ({
            pokemon: pokemon._id,
            count: 1,
          })),
        },
      },
    },
  );

  if (updateResult.modifiedCount === 0) {
    throw new AppError("That hatch sold out a moment ago. Please try again.", 409, {
      code: "STOCK_CHANGED",
    });
  }

  const updatedUser = await User.findById(userId);

  if (!updatedUser) {
    throw new AppError("User account not found", 404);
  }

  return NextResponse.json(
    {
      success: true,
      hatched: selected.map((pokemon) => ({
        id: pokemon.id,
        name: pokemon.name,
        types: pokemon.types ?? [],
        frontSpriteUrl: pokemon.frontSpriteUrl,
      })),
      user: updatedUser,
    },
    { status: 201 },
  );
});
