import type { Request, Response, NextFunction } from "express";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // Log error for internal tracking (use Winston or Bunyan in a real prod env)
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  res.status(statusCode).json({
    status: "error",
    message: message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    ...(err.extraData && { ...err.extraData }),
  });
};
