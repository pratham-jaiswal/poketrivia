/**
 * Cloudinary utilities for image optimization
 */

export function getCloudinaryBase(): string {
  return (
    process.env.NEXT_PUBLIC_CLOUDINARY_BASE ||
    "https://res.cloudinary.com/default/image/upload"
  );
}

/**
 * Build a Cloudinary image URL with transformations
 */
export function buildCloudinaryUrl(
  publicId: string,
  options?: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
  },
): string {
  const base = getCloudinaryBase();

  const transforms = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.height) transforms.push(`h_${options.height}`);
  if (options?.crop) transforms.push(`c_${options.crop}`);
  if (options?.quality) transforms.push(`q_${options.quality}`);

  const transformString =
    transforms.length > 0 ? `${transforms.join(",")}/` : "";

  return `${base}/${transformString}${publicId}`;
}

/**
 * Verify that Cloudinary is configured
 */
export function validateCloudinaryConfig(): void {
  if (!process.env.NEXT_PUBLIC_CLOUDINARY_BASE) {
    console.warn(
      "[CLOUDINARY] NEXT_PUBLIC_CLOUDINARY_BASE not set, using default",
    );
  }
}
