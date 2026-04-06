import type { IEggPricing } from "../custom_types.ts";

export function calculateFinalPrice(pricing: IEggPricing) {
  const now = new Date();

  const hasPercent =
    typeof pricing.discountPercent === "number" && pricing.discountPercent > 0;

  const isDiscountValid =
    hasPercent &&
    pricing.discountExpiresAt &&
    new Date(pricing.discountExpiresAt) > now;

  let finalPrice = pricing.basePrice;

  if (isDiscountValid) {
    const discountAmount = pricing.basePrice * (pricing.discountPercent! / 100);
    finalPrice = Math.max(0, Math.round(pricing.basePrice - discountAmount));
  }

  return {
    finalPrice,
    isDiscountValid,
  };
}
