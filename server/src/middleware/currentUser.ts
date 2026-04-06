import { AppError } from "../utils/AppError.ts";
import { catchAsync } from "../utils/catchAsync.ts";
import type { Request, Response, NextFunction } from "express";
import { User } from "../models.ts";

export const currentUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    if (req.path === "/api/new-user") return next();

    const claims = req.auth?.payload;
    const email = claims?.["user_email"] as string;

    if (!email) {
      return next(
        new AppError("Authentication token missing user email.", 401),
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(new AppError("User account no longer exists.", 404));
    }

    req.user = user;
    next();
  },
);
