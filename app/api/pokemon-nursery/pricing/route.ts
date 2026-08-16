import { NextResponse } from "next/server";
import { connect } from "@/lib/mongoose";
import { validateAuth } from "@/lib/authMiddleware";
import { EggPricing } from "@/lib/models";
import { Pokemon } from "@/lib/models";
import { calculateFinalPrice } from "@/lib/pricingUtil";
import { catchAsync } from "@/lib/catchAsync";

/**
 * GET /api/pokemon-nursery/pricing
 * Get available egg pricing (no auth required for UI)
 */
export const GET = catchAsync(async () => {
  await connect();

  const { user } = await validateAuth();
  const ownedIds = Array.isArray(user.pokemons)
    ? user.pokemons.map((entry: any) => entry.pokemon)
    : [];

  const list = await EggPricing.find({ isActive: true }).lean();

  const data = await Promise.all(
    list.map(async (item: any) => {
      const { finalPrice, isDiscountValid } = calculateFinalPrice(item);

      const availableCount = await Pokemon.countDocuments({
        isLegendary: item.category === "legendary",
        isMythical: item.category === "mythical",
        _id: { $nin: ownedIds },
      });

      const canPurchase = availableCount >= Math.max(1, item.quantity ?? 1);

      return {
        mode: item.mode,
        displayName: item.displayName,
        description: item.description,
        category: item.category,
        quantity: item.quantity,
        dialogue: item.dialogue,
        basePrice: item.basePrice,
        finalPrice,
        discountPercent: isDiscountValid ? item.discountPercent : null,
        discountExpiresAt: isDiscountValid ? item.discountExpiresAt : null,
        availableCount,
        canPurchase,
      };
    }),
  );

  return NextResponse.json({ data });
});
