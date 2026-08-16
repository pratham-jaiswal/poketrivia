import { auth0 } from "./auth0";
import { connect } from "./mongoose";
import { User } from "./models";
import { AppError } from "./appError";

export interface AuthContext {
  userId: string;
  email: string;
  user: any;
}

/**
 * Validates Auth0 session and retrieves user from DB
 * Used in API routes that require authentication
 */
export const validateAuth = async (): Promise<AuthContext> => {
  try {
    const session = await auth0.getSession();

    if (!session?.user?.email) {
      throw new AppError("Authentication required", 401);
    }

    await connect();

    let user = await User.findOne({ email: session.user.email });

    if (!user) {
      const username =
        session.user.name ||
        session.user.nickname ||
        session.user.email.split("@")[0];
      user = await User.create({
        username,
        email: session.user.email,
        pokemons: [],
        totalScore: 0,
        pokecoins: 0,
        lastDailyBonus: new Date(0),
        loginStreak: 0,
      });
    }

    return {
      userId: user._id.toString(),
      email: session.user.email,
      user,
    };
  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Authentication failed", 401);
  }
};
