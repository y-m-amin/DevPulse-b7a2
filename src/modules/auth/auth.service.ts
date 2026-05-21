import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import { AppError } from "../../utils/app-error";
import { comparePassword, hashPassword } from "../../utils/password";
import { signJwt } from "../../utils/jwt";
import { LoginInput, SignupInput } from "./auth.validation";

interface UserRow {
  id: number;
  name: string;
  email: string;
  password: string;
  role: "contributor" | "maintainer";
  created_at: string;
  updated_at: string;
}

function sanitizeUser(user: UserRow) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at
  };
}

export async function signupUser(input: SignupInput) {
  const existingUserResult = await pool.query(
    `
    SELECT id
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [input.email]
  );

  if (existingUserResult.rowCount && existingUserResult.rowCount > 0) {
    throw new AppError("Email already exists", StatusCodes.BAD_REQUEST);
  }

  const hashedPassword = await hashPassword(input.password);

  const createdUserResult = await pool.query<UserRow>(
    `
    INSERT INTO users (name, email, password, role)
    VALUES ($1, $2, $3, $4)
    RETURNING id, name, email, password, role, created_at, updated_at
    `,
    [input.name, input.email, hashedPassword, input.role]
  );

  return sanitizeUser(createdUserResult.rows[0]);
}

export async function loginUser(input: LoginInput) {
  const userResult = await pool.query<UserRow>(
    `
    SELECT id, name, email, password, role, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
    `,
    [input.email]
  );

  if (!userResult.rowCount) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const user = userResult.rows[0];

  const isPasswordValid = await comparePassword(input.password, user.password);

  if (!isPasswordValid) {
    throw new AppError("Invalid email or password", StatusCodes.UNAUTHORIZED);
  }

  const token = signJwt({
    id: user.id,
    name: user.name,
    role: user.role
  });

  return {
    token,
    user: sanitizeUser(user)
  };
}