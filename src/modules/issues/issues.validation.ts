import { StatusCodes } from "http-status-codes";
import { AppError } from "../../utils/app-error";

export type IssueType = "bug" | "feature_request";
export type IssueStatus = "open" | "in_progress" | "resolved";
export type IssueSort = "newest" | "oldest";

export interface CreateIssueInput {
  title: string;
  description: string;
  type: IssueType;
}

export interface UpdateIssueInput {
  title?: string;
  description?: string;
  type?: IssueType;
  status?: IssueStatus;
}

export interface GetIssuesQuery {
  sort: IssueSort;
  type?: IssueType;
  status?: IssueStatus;
}

const allowedTypes: IssueType[] = ["bug", "feature_request"];
const allowedStatuses: IssueStatus[] = ["open", "in_progress", "resolved"];
const allowedSorts: IssueSort[] = ["newest", "oldest"];

export function validateIssueId(id: string): number {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new AppError("Invalid issue id", StatusCodes.BAD_REQUEST);
  }

  return parsedId;
}

function validateTitle(title: unknown): string {
  const value = typeof title === "string" ? title.trim() : "";

  if (!value) {
    throw new AppError("Title is required", StatusCodes.BAD_REQUEST);
  }

  if (value.length > 150) {
    throw new AppError("Title must not exceed 150 characters", StatusCodes.BAD_REQUEST);
  }

  return value;
}

function validateDescription(description: unknown): string {
  const value = typeof description === "string" ? description.trim() : "";

  if (!value) {
    throw new AppError("Description is required", StatusCodes.BAD_REQUEST);
  }

  if (value.length < 20) {
    throw new AppError("Description must be at least 20 characters long", StatusCodes.BAD_REQUEST);
  }

  return value;
}

function validateType(type: unknown): IssueType {
  if (type !== "bug" && type !== "feature_request") {
    throw new AppError("Type must be bug or feature_request", StatusCodes.BAD_REQUEST);
  }

  return type;
}

function validateStatus(status: unknown): IssueStatus {
  if (status !== "open" && status !== "in_progress" && status !== "resolved") {
    throw new AppError("Status must be open, in_progress, or resolved", StatusCodes.BAD_REQUEST);
  }

  return status;
}

export function validateCreateIssueBody(body: unknown): CreateIssueInput {
  const data = body as Partial<CreateIssueInput>;

  return {
    title: validateTitle(data.title),
    description: validateDescription(data.description),
    type: validateType(data.type)
  };
}

export function validateUpdateIssueBody(body: unknown): UpdateIssueInput {
  const data = body as Partial<UpdateIssueInput>;

  const input: UpdateIssueInput = {};

  if (data.title !== undefined) {
    input.title = validateTitle(data.title);
  }

  if (data.description !== undefined) {
    input.description = validateDescription(data.description);
  }

  if (data.type !== undefined) {
    input.type = validateType(data.type);
  }

  if (data.status !== undefined) {
    input.status = validateStatus(data.status);
  }

  if (
    input.title === undefined &&
    input.description === undefined &&
    input.type === undefined &&
    input.status === undefined
  ) {
    throw new AppError("At least one valid field is required", StatusCodes.BAD_REQUEST);
  }

  return input;
}

export function validateGetIssuesQuery(query: unknown): GetIssuesQuery {
  const data = query as {
    sort?: string;
    type?: string;
    status?: string;
  };

  const sort = data.sort || "newest";

  if (!allowedSorts.includes(sort as IssueSort)) {
    throw new AppError("Sort must be newest or oldest", StatusCodes.BAD_REQUEST);
  }

  const result: GetIssuesQuery = {
    sort: sort as IssueSort
  };

  if (data.type !== undefined) {
    if (!allowedTypes.includes(data.type as IssueType)) {
      throw new AppError("Type must be bug or feature_request", StatusCodes.BAD_REQUEST);
    }

    result.type = data.type as IssueType;
  }

  if (data.status !== undefined) {
    if (!allowedStatuses.includes(data.status as IssueStatus)) {
      throw new AppError("Status must be open, in_progress, or resolved", StatusCodes.BAD_REQUEST);
    }

    result.status = data.status as IssueStatus;
  }

  return result;
}