
---

# `API_DOCS.md`

Create `API_DOCS.md` in the project root:

```md
# API Documentation

Base URL:

```txt
http://localhost:5000
```
Common Headers

For JSON requests:
```
Content-Type: application/json
```
For protected endpoints:
```
Authorization: <JWT_TOKEN>
```
Bearer format is also supported:
```
Authorization: Bearer <JWT_TOKEN>
```
Standard Success Response
```
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Standard Error Response
```
{
  "success": false,
  "message": "Error description",
  "errors": "Optional error details"
}
```
Status Codes
Code	Meaning	Usage
200	OK	Successful GET, PATCH, DELETE
201	Created	Successful resource creation
400	Bad Request	Invalid input
401	Unauthorized	Missing, invalid, or expired token
403	Forbidden	Valid token but insufficient permission
404	Not Found	Resource does not exist
409	Conflict	Business rule conflict
500	Internal Server Error	Unexpected server or database error
Health
Health Check
GET /health
Access

Public

Success Response
```
{
  "success": true,
  "message": "API is running"
}
```
Auth Module

Base route:
```
/api/auth
```
1. Signup
```
POST /api/auth/signup
```
Access

Public

Description

Registers a new user account.

Request Body
```
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```
Field Rules
Field	Rule
name	Required
email	Required, valid email, unique
password	Required, minimum 8 characters
role	Optional, must be contributor or maintainer

If role is not sent, the system uses:
```
contributor
Success Response
```
Status:
```
201 Created
```
Response:
```
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john.doe@devpulse.com",
    "role": "contributor",
    "created_at": "2026-01-20T09:00:00.000Z",
    "updated_at": "2026-01-20T09:00:00.000Z"
  }
}
```
Important

The password must never appear in the response.

2. Login
```
POST /api/auth/login
```
Access

Public

Description

Authenticates a user and returns a JWT token.

Request Body
```
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```
Success Response

Status:
```
200 OK
```
Response:
```
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN_HERE",
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@devpulse.com",
      "role": "contributor",
      "created_at": "2026-01-20T09:00:00.000Z",
      "updated_at": "2026-01-20T09:00:00.000Z"
    }
  }
}
```
JWT Payload

The token contains:
```
{
  "id": 1,
  "name": "John Doe",
  "role": "contributor"
}
```
Issues Module

Base route:
```
/api/issues
```
3. Create Issue
```
POST /api/issues
```
Access

Authenticated users:
```
contributor
maintainer
Headers
Authorization: <JWT_TOKEN>
Content-Type: application/json
```
Description

Creates a new bug report or feature request.

The reporter_id is taken from the decoded JWT, not from the request body.

Request Body
```
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```
Field Rules
Field	Rule
title	Required, maximum 150 characters
description	Required, minimum 20 characters
type	Required, must be bug or feature_request
Success Response

Status:
```
201 Created
```
Response:
```
{
  "success": true,
  "message": "Issue created successfully",
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T10:30:00.000Z"
  }
}

```
4. Get All Issues
```
GET /api/issues
```
Access

Public

Description

Returns all issues with optional sorting and filtering.

Query Parameters
Parameter	Allowed Values	Default
sort	newest, oldest	newest
type	bug, feature_request	none
status	open, in_progress, resolved	none
Example Requests
GET /api/issues
GET /api/issues?sort=newest
GET /api/issues?sort=oldest&type=bug
GET /api/issues?type=feature_request&status=open
Success Response

Status:
```
200 OK
```
Response:
```
{
  "success": true,
  "data": [
    {
      "id": 45,
      "title": "Database connection timeout under load",
      "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
      "type": "bug",
      "status": "open",
      "reporter": {
        "id": 1,
        "name": "John Doe",
        "role": "contributor"
      },
      "created_at": "2026-01-20T10:30:00.000Z",
      "updated_at": "2026-01-20T14:45:00.000Z"
    }
  ]
}
```
Note

Reporter details are fetched separately without SQL JOINs.

5. Get Single Issue
GET /api/issues/:id
Access

Public

Example
GET /api/issues/45
Success Response

Status:

200 OK

Response:
```
{
  "success": true,
  "data": {
    "id": 45,
    "title": "Database connection timeout under load",
    "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
    "type": "bug",
    "status": "open",
    "reporter": {
      "id": 1,
      "name": "John Doe",
      "role": "contributor"
    },
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T14:45:00.000Z"
  }
}
```
Not Found Response

Status:

404 Not Found

Response:
```
{
  "success": false,
  "message": "Issue not found"
}
```
6. Update Issue
PATCH /api/issues/:id
Access

Authenticated users.

Permission Rules

Maintainer:

Can update any issue.
Can update title, description, type, and status.

Contributor:

Can update only their own issue.
Can update only when the issue status is open.
Cannot update issue status.
Headers
Authorization: <JWT_TOKEN>
Content-Type: application/json
Example: Contributor Update
PATCH /api/issues/45
```
{
  "title": "Updated database timeout bug",
  "description": "Updated description with more reproduction details",
  "type": "bug"
}
```
Example: Maintainer Status Update
PATCH /api/issues/45
```
{
  "status": "in_progress"
}
```
Example: Maintainer Full Update
```
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps and expected behavior",
  "type": "bug",
  "status": "resolved"
}
```
Success Response

Status:

200 OK

Response:
```
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps and expected behavior",
    "type": "bug",
    "status": "resolved",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T14:45:00.000Z"
  }
}
```
Forbidden Response

Status:

403 Forbidden

Response:
```
{
  "success": false,
  "message": "You can only update your own issue"
}
```
Contributor Status Update Error

Status:

403 Forbidden

Response:
```
{
  "success": false,
  "message": "Contributors cannot update issue status"
}
```
Contributor Non-Open Issue Error

Status:

409 Conflict

Response:
```
{
  "success": false,
  "message": "Only open issues can be updated by contributors"
}
```
7. Delete Issue
DELETE /api/issues/:id
Access

Maintainer only.

Headers
Authorization: <JWT_TOKEN>
Example
DELETE /api/issues/45
Success Response

Status:

200 OK

Response:
```
{
  "success": true,
  "message": "Issue deleted successfully"
}
```
Contributor Error

Status:

403 Forbidden

Response:
```
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```
Metrics Module

Base route:

/api/metrics
8. Get Internal Metrics
GET /api/metrics/internal
Access

Maintainer only.

Headers
Authorization: <JWT_TOKEN>
Description

Returns internal system metrics for maintainers.

Success Response

Status:

200 OK

Response:
```
{
  "success": true,
  "message": "Internal metrics retrieved successfully",
  "data": {
    "users": {
      "total_users": 2,
      "contributors": 1,
      "maintainers": 1
    },
    "issues": {
      "total_issues": 4,
      "bugs": 3,
      "feature_requests": 1,
      "open": 2,
      "in_progress": 1,
      "resolved": 1
    },
    "activity": {
      "users_created_today": 2,
      "issues_created_today": 4,
      "issues_updated_today": 4
    }
  }
}
```
Contributor Error

Status:

403 Forbidden

Response:
```
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

Testing Flow
Step 1: Health Check
GET http://localhost:5000/health
Step 2: Create Contributor
POST http://localhost:5000/api/auth/signup
```
{
  "name": "Test Contributor",
  "email": "contributor@test.com",
  "password": "contributor123",
  "role": "contributor"
}
```
Step 3: Login Contributor
POST http://localhost:5000/api/auth/login
```
{
  "email": "contributor@test.com",
  "password": "contributor123"
}
```

Copy the returned token.

Step 4: Create Issue as Contributor
POST http://localhost:5000/api/issues

Headers:

Authorization: CONTRIBUTOR_TOKEN
Content-Type: application/json

Body:
```
{
  "title": "Login page crashes on invalid password",
  "description": "When a user enters an invalid password repeatedly, the login page returns a server error.",
  "type": "bug"
}
```
Step 5: Get All Issues
GET http://localhost:5000/api/issues
Step 6: Get Single Issue
GET http://localhost:5000/api/issues/1
Step 7: Create Maintainer
POST http://localhost:5000/api/auth/signup
```
{
  "name": "Test Maintainer",
  "email": "maintainer@test.com",
  "password": "maintainer123",
  "role": "maintainer"
}
```
Step 8: Login Maintainer
POST http://localhost:5000/api/auth/login
```
{
  "email": "maintainer@test.com",
  "password": "maintainer123"
}
```

Copy the returned token.

Step 9: Update Issue Status as Maintainer
PATCH http://localhost:5000/api/issues/1

Headers:

Authorization: MAINTAINER_TOKEN
Content-Type: application/json

Body:

{
  "status": "in_progress"
}
Step 10: Confirm Contributor Cannot Update Non-Open Issue
PATCH http://localhost:5000/api/issues/1

Headers:

Authorization: CONTRIBUTOR_TOKEN
Content-Type: application/json

Body:

{
  "title": "Contributor trying to update non-open issue"
}

Expected:

409 Conflict
Step 11: Test Maintainer Metrics
GET http://localhost:5000/api/metrics/internal

Headers:

Authorization: MAINTAINER_TOKEN
Step 12: Confirm Contributor Cannot Access Metrics
GET http://localhost:5000/api/metrics/internal

Headers:

Authorization: CONTRIBUTOR_TOKEN

Expected:

403 Forbidden
Step 13: Delete Issue as Maintainer
DELETE http://localhost:5000/api/issues/1

Headers:

Authorization: MAINTAINER_TOKEN

Expected:

200 OK
Validation Checklist
- Auth
- Signup requires name.
- Signup requires valid email.
- Signup blocks duplicate email.
- Signup hashes password.
- Signup does not return password.
- Login rejects wrong email.
- Login rejects wrong password.
- Login returns JWT.
- JWT includes id, name, and role.
- Issues
- Authenticated user can create issue.
- Public user can view all issues.
- Public user can view single issue.
- Invalid issue ID returns 400.
- Missing issue returns 404.
- Contributor can update own open issue.
- Contributor cannot update another user's issue.
- Contributor cannot update status.
- Contributor cannot update non-open issue.
- Maintainer can update any issue.
- Maintainer can update status.
- Maintainer can delete issue.
- Contributor cannot delete issue.
- Metrics
- No token returns 401.
- Contributor token returns 403.
- Maintainer token returns 200.
- Metrics totals match database records.