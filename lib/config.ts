import { validateCloudinaryConfig } from "@/lib/cloudinary";
import { validateEnv, logEnvStatus } from "@/lib/env";

/**
 * Run on application startup to validate all configuration
 */
export function validateAppConfig(): void {
  // Validate all environment variables
  validateEnv();

  // Validate Cloudinary configuration
  validateCloudinaryConfig();

  // Log env status in development
  if (process.env.NODE_ENV === "development") {
    logEnvStatus();
  }
}
