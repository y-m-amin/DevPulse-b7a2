import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { getInternalMetrics } from "./metrics.service";

export const getInternalMetricsController = asyncHandler(
  async (_req: Request, res: Response) => {
    const metrics = await getInternalMetrics();

    sendSuccess(
      res,
      StatusCodes.OK,
      "Internal metrics retrieved successfully",
      metrics
    );
  }
);