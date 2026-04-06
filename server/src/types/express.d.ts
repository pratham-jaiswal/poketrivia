import type { IUser } from "../custom_types.ts";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}
