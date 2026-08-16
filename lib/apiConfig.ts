/**
 * Get API base URL from environment or use default
 * In production, this allows pointing to a different API domain
 */
export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    // Client-side: use NEXT_PUBLIC_API_URL
    return process.env.NEXT_PUBLIC_API_URL || "";
  }
  // Server-side: use full URL
  const baseUrl = process.env.AUTH0_BASE_URL || "http://localhost:3000";
  return baseUrl;
}

/**
 * Construct full API URL for fetch requests
 */
export function getApiUrl(path: string): string {
  const base = getApiBaseUrl();
  if (!base) return path;
  return `${base}${path}`;
}
