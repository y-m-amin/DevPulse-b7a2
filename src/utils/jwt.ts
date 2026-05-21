import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./app-error";
import { StatusCodes } from "http-status-codes";

export type UserRole = "contributor" | "maintainer";

export interface JwtUserPayload {
  id: number;
  name: string;
  role: UserRole;
}

export function signJwt(payload: JwtUserPayload) {
  const options: SignOptions = {
    expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"]
  };

  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyJwt(token: string): JwtUserPayload {
  try {
    const decoded = jwt.verify(token, env.jwtSecret);

    if (
      typeof decoded !== "object" ||
      decoded === null ||
      typeof decoded.id !== "number" ||
      typeof decoded.name !== "string" ||
      (decoded.role !== "contributor" && decoded.role !== "maintainer")
    ) {
      throw new AppError("Invalid token payload", StatusCodes.UNAUTHORIZED);
    }

    return {
      id: decoded.id,
      name: decoded.name,
      role: decoded.role
    };
  } catch {
    throw new AppError("Invalid or expired token", StatusCodes.UNAUTHORIZED);
  }
}