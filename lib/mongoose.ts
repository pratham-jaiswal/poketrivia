import mongoose from "mongoose";
import { validateEnv } from "./env";

// Validate all required environment variables on startup
validateEnv();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local",
  );
}

/**
 * Prevent multiple connections in development
 */
let cached: { conn: typeof mongoose | null } = (global as any)._mongoose || {
  conn: null,
};

if (!cached.conn) {
  cached.conn = mongoose;
}

export async function connect() {
  if (
    cached.conn &&
    (cached.conn as any).connection &&
    (cached.conn as any).connection.readyState === 1
  ) {
    return cached.conn;
  }

  if (!MONGODB_URI) {
    throw new Error(
      "Please define the MONGODB_URI environment variable inside .env.local",
    );
  }

  await mongoose.connect(MONGODB_URI, { family: 4 });
  cached.conn = mongoose;
  (global as any)._mongoose = cached;
  return mongoose;
}
