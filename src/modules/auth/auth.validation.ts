import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/app-error";
import { UserRole } from "../../utils/jwt";

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginInput {
  email: string;
  password: string;
}

const allowedRoles: UserRole[] = ["contributor", "maintainer"];

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateSignupBody(body: unknown): SignupInput {
  const data = body as Partial<SignupInput>;

  const name = typeof data.name === "string" ? data.name.trim() : "";
  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";
  const role = data.role || "contributor";

  if (!name) {
    throw new AppError("Name is required", StatusCodes.BAD_REQUEST);
  }

  if (!email || !isValidEmail(email)) {
    throw new AppError("Valid email is required", StatusCodes.BAD_REQUEST);
  }

  if (!password || password.length < 8) {
    throw new AppError("Password must be at least 8 characters long", StatusCodes.BAD_REQUEST);
  }

  if (!allowedRoles.includes(role)) {
    throw new AppError("Role must be contributor or maintainer", StatusCodes.BAD_REQUEST);
  }

  return {
    name,
    email,
    password,
    role
  };
}

export function validateLoginBody(body: unknown): LoginInput {
  const data = body as Partial<LoginInput>;

  const email = typeof data.email === "string" ? data.email.trim().toLowerCase() : "";
  const password = typeof data.password === "string" ? data.password : "";

  if (!email || !isValidEmail(email)) {
    throw new AppError("Valid email is required", StatusCodes.BAD_REQUEST);
  }

  if (!password) {
    throw new AppError("Password is required", StatusCodes.BAD_REQUEST);
  }

  return {
    email,
    password
  };
}