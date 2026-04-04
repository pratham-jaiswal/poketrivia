import type { IEggPricing } from "./custom_types.ts";

export function calculateFinalPrice(pricing: IEggPricing) {
  const now = new Date();

  const isDiscountValid =
    pricing.discountPercent &&
    pricing.discountExpiresAt &&
    pricing.discountExpiresAt > now;

  const finalPrice = isDiscountValid
    ? Math.round(pricing.basePrice * (1 - pricing.discountPercent! / 100))
    : pricing.basePrice;

  return {
    finalPrice,
    isDiscountValid,
  };
}
