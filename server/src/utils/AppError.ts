export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly extraData?: any;

  constructor(message: string, statusCode: number, extraData?: any) {
    super(message);
    this.statusCode = statusCode;
    this.extraData = extraData;
    this.isOperational = true;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
