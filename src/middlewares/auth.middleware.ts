import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { AppError } from "../utils/app-error";
import { verifyJwt } from "../utils/jwt";

export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    throw new AppError("Authorization token is required", StatusCodes.UNAUTHORIZED);
  }

  const token = authorization.startsWith("Bearer ")
    ? authorization.split(" ")[1]
    : authorization;

  if (!token) {
    throw new AppError("Authorization token is required", StatusCodes.UNAUTHORIZED);
  }

  req.user = verifyJwt(token);

  next();
}