/**
 * Validate that all required environment variables are set
 * Run this at startup to catch configuration issues early
 */

interface EnvConfig {
  required: {
    server: string[]; // Only available on server
    public: string[]; // Available on client (NEXT_PUBLIC_*)
  };
  optional: string[];
}

const envConfig: EnvConfig = {
  required: {
    server: [
      "MONGODB_URI",
      "AUTH0_SECRET",
      "AUTH0_BASE_URL",
      "AUTH0_ISSUER_BASE_URL",
      "AUTH0_CLIENT_ID",
      "AUTH0_CLIENT_SECRET",
    ],
    public: ["NEXT_PUBLIC_CLOUDINARY_BASE"],
  },
  optional: ["NEXT_PUBLIC_API_URL", "NODE_ENV"],
};

export function validateEnv(): void {
  const missing: string[] = [];

  // Check required server variables
  for (const key of envConfig.required.server) {
    if (!process.env[key]) {
      missing.push(`${key} (server-only)`);
    }
  }

  // Check required public variables
  for (const key of envConfig.required.public) {
    if (!process.env[key]) {
      missing.push(`${key} (client-visible)`);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((m) => `  - ${m}`).join("\n")}\n\nCopy .env.local.example to .env.local and fill in the values.`,
    );
  }
}

/**
 * Log which environment variables are loaded (for debugging)
 */
export function logEnvStatus(): void {
  if (typeof window !== "undefined") return;

  const loaded: Record<string, boolean> = {};

  [
    ...envConfig.required.server,
    ...envConfig.required.public,
    ...envConfig.optional,
  ].forEach((key) => {
    loaded[key] = !!process.env[key];
  });

  console.log("[ENV] Configuration status:", loaded);
}

export { envConfig };
