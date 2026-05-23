import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { sendData, sendSuccess } from "../../utils/api-response";
import { asyncHandler } from "../../utils/async-handler";
import { AppError } from "../../utils/app-error";
import {
  createIssue,
  deleteIssue,
  getAllIssues,
  getIssueById,
  updateIssue
} from "./issues.service";
import {
  validateCreateIssueBody, 
  validateGetIssuesQuery,
  validateIssueId,
  validateUpdateIssueBody
} from "./issues.validation";

export const createIssueController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
  }

  const input = validateCreateIssueBody(req.body);
  const issue = await createIssue(input, req.user);

  sendSuccess(res, StatusCodes.CREATED, "Issue created successfully", issue);
});

export const getAllIssuesController = asyncHandler(async (req: Request, res: Response) => {
  const query = validateGetIssuesQuery(req.query);
  const issues = await getAllIssues(query);

  sendData(res, StatusCodes.OK, issues);
});

export const getSingleIssueController = asyncHandler(async (req: Request, res: Response) => {
  const issueId = validateIssueId(String(req.params.id));
  const issue = await getIssueById(issueId);

  sendData(res, StatusCodes.OK, issue);
});

export const updateIssueController = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", StatusCodes.UNAUTHORIZED);
  }

  const issueId = validateIssueId(String(req.params.id));
  const input = validateUpdateIssueBody(req.body);

  const issue = await updateIssue(issueId, input, req.user);

  sendSuccess(res, StatusCodes.OK, "Issue updated successfully", issue);
});

export const deleteIssueController = asyncHandler(async (req: Request, res: Response) => {
  const issueId = validateIssueId(String(req.params.id));

  await deleteIssue(issueId);

  sendSuccess(res, StatusCodes.OK, "Issue deleted successfully");
});