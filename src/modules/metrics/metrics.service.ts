import { pool } from "../../config/db";

interface UserMetricsRow {
  total_users: number;
  contributors: number;
  maintainers: number;
}

interface IssueMetricsRow {
  total_issues: number;
  bugs: number;
  feature_requests: number;
  open: number;
  in_progress: number;
  resolved: number;
}

interface ActivityMetricsRow {
  users_created_today: number;
  issues_created_today: number;
  issues_updated_today: number;
}

export async function getInternalMetrics() {
  const userMetricsPromise = pool.query<UserMetricsRow>(
    `
    SELECT
      COUNT(*)::int AS total_users,
      COUNT(*) FILTER (WHERE role = 'contributor')::int AS contributors,
      COUNT(*) FILTER (WHERE role = 'maintainer')::int AS maintainers
    FROM users
    `
  );

  const issueMetricsPromise = pool.query<IssueMetricsRow>(
    `
    SELECT
      COUNT(*)::int AS total_issues,
      COUNT(*) FILTER (WHERE type = 'bug')::int AS bugs,
      COUNT(*) FILTER (WHERE type = 'feature_request')::int AS feature_requests,
      COUNT(*) FILTER (WHERE status = 'open')::int AS open,
      COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress,
      COUNT(*) FILTER (WHERE status = 'resolved')::int AS resolved
    FROM issues
    `
  );

  const activityMetricsPromise = pool.query<ActivityMetricsRow>(
    `
    SELECT
      (SELECT COUNT(*)::int FROM users WHERE created_at >= CURRENT_DATE) AS users_created_today,
      (SELECT COUNT(*)::int FROM issues WHERE created_at >= CURRENT_DATE) AS issues_created_today,
      (SELECT COUNT(*)::int FROM issues WHERE updated_at >= CURRENT_DATE) AS issues_updated_today
    `
  );

  const [userMetricsResult, issueMetricsResult, activityMetricsResult] =
    await Promise.all([
      userMetricsPromise,
      issueMetricsPromise,
      activityMetricsPromise
    ]);

  return {
    users: userMetricsResult.rows[0],
    issues: issueMetricsResult.rows[0],
    activity: activityMetricsResult.rows[0]
  };
}