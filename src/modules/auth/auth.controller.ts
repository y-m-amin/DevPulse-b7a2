import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../../utils/async-handler";
import { sendSuccess } from "../../utils/api-response";
import { loginUser, signupUser } from "./auth.service";
import { validateLoginBody, validateSignupBody } from "./auth.validation";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const input = validateSignupBody(req.body);
  const user = await signupUser(input);

  sendSuccess(res, StatusCodes.CREATED, "User registered successfully", user);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = validateLoginBody(req.body); 
  const data = await loginUser(input);

  sendSuccess(res, StatusCodes.OK, "Login successful", data);
});