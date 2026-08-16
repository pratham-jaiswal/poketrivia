import { NextRequest, NextResponse } from "next/server";
import { AppError } from "./appError";

export type AsyncRouteHandler = (
  req: NextRequest,
  context?: any,
) => Promise<NextResponse>;

export const catchAsync = (fn: AsyncRouteHandler): AsyncRouteHandler => {
  return async (req: NextRequest, context?: any) => {
    try {
      return await fn(req, context);
    } catch (err) {
      const error = err as any;

      // Handle AppError instances
      if (error instanceof AppError) {
        return NextResponse.json(
          {
            status: "error",
            message: error.message,
            ...(error.extraData && { ...error.extraData }),
          },
          { status: error.statusCode },
        );
      }

      // Handle general errors
      console.error("[API ERROR]:", error);
      return NextResponse.json(
        {
          status: "error",
          message: error?.message || "Internal Server Error",
          ...(process.env.NODE_ENV === "development" && {
            stack: error?.stack,
          }),
        },
        { status: 500 },
      );
    }
  };
};
