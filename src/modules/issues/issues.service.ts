import { StatusCodes } from "http-status-codes";
import { pool } from "../../config/db";
import { AppError } from "../../utils/app-error";
import { JwtUserPayload } from "../../utils/jwt";
import {
  CreateIssueInput,
  GetIssuesQuery,
  IssueStatus,
  IssueType,
  UpdateIssueInput
} from "./issues.validation";

interface IssueRow {
  id: number;
  title: string;
  description: string;
  type: IssueType;
  status: IssueStatus;
  reporter_id: number;
  created_at: string;
  updated_at: string;
}

interface ReporterRow {
  id: number;
  name: string;
  role: "contributor" | "maintainer";
}

function mapReporterById(reporters: ReporterRow[]) {
  const reporterMap = new Map<number, ReporterRow>();

  for (const reporter of reporters) {
    reporterMap.set(reporter.id, reporter);
  }

  return reporterMap;
}

async function attachReporters(issues: IssueRow[]) {
  const reporterIds = Array.from(new Set(issues.map((issue) => issue.reporter_id)));

  if (reporterIds.length === 0) {
    return [];
  }

  const reportersResult = await pool.query<ReporterRow>(
    `
    SELECT id, name, role
    FROM users
    WHERE id = ANY($1::int[])
    `,
    [reporterIds]
  );

  const reporterMap = mapReporterById(reportersResult.rows);

  return issues.map((issue) => {
    const reporter = reporterMap.get(issue.reporter_id) || null;

    return {
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,
      reporter,
      created_at: issue.created_at,
      updated_at: issue.updated_at
    };
  });
}

async function attachSingleReporter(issue: IssueRow) {
  const result = await attachReporters([issue]);
  return result[0];
}

export async function createIssue(input: CreateIssueInput, user: JwtUserPayload) {
  const result = await pool.query<IssueRow>(
    `
    INSERT INTO issues (title, description, type, reporter_id)
    VALUES ($1, $2, $3, $4)
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    [input.title, input.description, input.type, user.id]
  );

  return result.rows[0];
}

export async function getAllIssues(query: GetIssuesQuery) {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (query.type) {
    values.push(query.type);
    conditions.push(`type = $${values.length}`);
  }

  if (query.status) {
    values.push(query.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderDirection = query.sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query<IssueRow>(
    `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    ${whereClause}
    ORDER BY created_at ${orderDirection}, id ${orderDirection}
    `,
    values
  );

  return attachReporters(issuesResult.rows);
}

export async function getIssueById(issueId: number) {
  const issueResult = await pool.query<IssueRow>(
    `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    WHERE id = $1
    LIMIT 1
    `,
    [issueId]
  );

  if (!issueResult.rowCount) {
    throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
  }

  return attachSingleReporter(issueResult.rows[0]);
}

async function getIssueRawById(issueId: number) {
  const issueResult = await pool.query<IssueRow>(
    `
    SELECT id, title, description, type, status, reporter_id, created_at, updated_at
    FROM issues
    WHERE id = $1
    LIMIT 1
    `,
    [issueId]
  );

  if (!issueResult.rowCount) {
    throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
  }

  return issueResult.rows[0];
}

export async function updateIssue(
  issueId: number,
  input: UpdateIssueInput,
  user: JwtUserPayload
) {
  const existingIssue = await getIssueRawById(issueId);

  const isMaintainer = user.role === "maintainer";
  const isOwner = existingIssue.reporter_id === user.id;

  if (!isMaintainer) {
    if (!isOwner) {
      throw new AppError("You can only update your own issue", StatusCodes.FORBIDDEN);
    }

    if (existingIssue.status !== "open") {
      throw new AppError("Only open issues can be updated by contributors", StatusCodes.CONFLICT);
    }

    if (input.status !== undefined) {
      throw new AppError("Contributors cannot update issue status", StatusCodes.FORBIDDEN);
    }
  }

  const fields: string[] = [];
  const values: unknown[] = [];

  if (input.title !== undefined) {
    values.push(input.title);
    fields.push(`title = $${values.length}`);
  }

  if (input.description !== undefined) {
    values.push(input.description);
    fields.push(`description = $${values.length}`);
  }

  if (input.type !== undefined) {
    values.push(input.type);
    fields.push(`type = $${values.length}`);
  }

  if (input.status !== undefined) {
    values.push(input.status);
    fields.push(`status = $${values.length}`);
  }

  values.push(issueId);

  const result = await pool.query<IssueRow>(
    `
    UPDATE issues
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${values.length}
    RETURNING id, title, description, type, status, reporter_id, created_at, updated_at
    `,
    values
  );

  return result.rows[0];
}

export async function deleteIssue(issueId: number) {
  const result = await pool.query<IssueRow>(
    `
    DELETE FROM issues
    WHERE id = $1
    RETURNING id
    `,
    [issueId]
  );

  if (!result.rowCount) {
    throw new AppError("Issue not found", StatusCodes.NOT_FOUND);
  }
}