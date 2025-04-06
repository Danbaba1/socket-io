import { Request } from "express";
import { UserDocument, UserRole } from "../@api-user/user.model.js";

export interface ReqUser extends Request {
  user?: {
    _id?: string;
    email?: string;
    username?: string;
    role?: UserRole;
  }
}

export type Payload = Pick<UserDocument, "_id" | "email" | "role" | "username">;
