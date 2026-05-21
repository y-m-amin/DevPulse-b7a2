import { Response } from "express";

export function sendSuccess<T>(
  res: Response,
  statusCode: number,
  message: string,
  data?: T
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data !== undefined && { data })
  });
}

export function sendData<T>(res: Response, statusCode: number, data: T) {
  return res.status(statusCode).json({
    success: true,
    data
  });
}