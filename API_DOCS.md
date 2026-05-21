# API Documentation

Base URL:

```
http://localhost:5000
```

---

## Common Headers

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

---

## Standard Responses

**Success**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

**Error**

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Optional error details"
}
```

---

## Status Codes

| Code | Reason | Usage |
|---|---|---|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful resource creation (POST) |
| 400 | Bad Request | Validation errors, invalid input, duplicate resource |
| 401 | Unauthorized | Missing, expired, or invalid JWT |
| 403 | Forbidden | Valid token but insufficient role/permissions |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Business logic conflict (e.g. contributor editing non-open issue) |
| 500 | Internal Server Error | Unexpected server or database error |

---

## Health

### Health Check

```
GET /health
```

Access: Public

**Response 200**

```json
{
  "success": true,
  "message": "API is running"
}
```

---

## Auth Module

Base route: `/api/auth`

---

### 1. Signup

```
POST /api/auth/signup
```

Access: Public

**Request Body**

```json
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}
```

| Field | Rule |
|---|---|
| name | Required |
| email | Required, valid email format, unique |
| password | Required, minimum 8 characters |
| role | Optional, must be `contributor` or `maintainer`, defaults to `contributor` |

**Response 201**

```json
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

The password is never returned in any response.

---

### 2. Login

```
POST /api/auth/login
```

Access: Public

**Request Body**

```json
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}
```

**Response 200**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
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

The JWT payload contains: `id`, `name`, `role`.

---

## Issues Module

Base route: `/api/issues`

---

### 3. Create Issue

```
POST /api/issues
```

Access: Authenticated (`contributor`, `maintainer`)

Headers:

```
Authorization: <JWT_TOKEN>
Content-Type: application/json
```

The `reporter_id` is taken from the decoded JWT, not the request body.

**Request Body**

```json
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries, causing 500 errors",
  "type": "bug"
}
```

| Field | Rule |
|---|---|
| title | Required, max 150 characters |
| description | Required, min 20 characters |
| type | Required, must be `bug` or `feature_request` |

**Response 201**

```json
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

---

### 4. Get All Issues

```
GET /api/issues
```

Access: Public

**Query Parameters**

| Parameter | Allowed Values | Default |
|---|---|---|
| sort | `newest`, `oldest` | `newest` |
| type | `bug`, `feature_request` | none |
| status | `open`, `in_progress`, `resolved` | none |

**Example Requests**

```
GET /api/issues
GET /api/issues?sort=oldest
GET /api/issues?sort=oldest&type=bug
GET /api/issues?type=feature_request&status=open
```

**Response 200**

```json
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

Reporter details are fetched separately without SQL JOINs.

---

### 5. Get Single Issue

```
GET /api/issues/:id
```

Access: Public

**Example**

```
GET /api/issues/45
```

**Response 200**

```json
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

**Response 404**

```json
{
  "success": false,
  "message": "Issue not found"
}
```

---

### 6. Update Issue

```
PATCH /api/issues/:id
```

Access: Authenticated

Headers:

```
Authorization: <JWT_TOKEN>
Content-Type: application/json
```

**Permission Rules**

Maintainer:
- Can update any issue
- Can update `title`, `description`, `type`, and `status`

Contributor:
- Can only update their own issue
- Can only update when issue status is `open`
- Cannot update `status`

**Request Body** (all fields optional, at least one required)

```json
{
  "title": "Updated: Database pool exhaustion fix needed",
  "description": "Updated description with reproduction steps...",
  "type": "bug",
  "status": "in_progress"
}
```

**Response 200**

```json
{
  "success": true,
  "message": "Issue updated successfully",
  "data": {
    "id": 45,
    "title": "Updated: Database pool exhaustion fix needed",
    "description": "Updated description with reproduction steps...",
    "type": "bug",
    "status": "in_progress",
    "reporter_id": 1,
    "created_at": "2026-01-20T10:30:00.000Z",
    "updated_at": "2026-01-20T14:45:00.000Z"
  }
}
```

**Response 403** — contributor updating another user's issue

```json
{
  "success": false,
  "message": "You can only update your own issue"
}
```

**Response 403** — contributor attempting to update status

```json
{
  "success": false,
  "message": "Contributors cannot update issue status"
}
```

**Response 409** — contributor updating a non-open issue

```json
{
  "success": false,
  "message": "Only open issues can be updated by contributors"
}
```

---

### 7. Delete Issue

```
DELETE /api/issues/:id
```

Access: Maintainer only

Headers:

```
Authorization: <JWT_TOKEN>
```

**Example**

```
DELETE /api/issues/45
```

**Response 200**

```json
{
  "success": true,
  "message": "Issue deleted successfully"
}
```

**Response 403** — contributor attempting delete

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

---

## Metrics Module

Base route: `/api/metrics`

---

### 8. Get Internal Metrics

```
GET /api/metrics/internal
```

Access: Maintainer only

Headers:

```
Authorization: <JWT_TOKEN>
```

**Response 200**

```json
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

**Response 403** — contributor attempting access

```json
{
  "success": false,
  "message": "You do not have permission to perform this action"
}
```

---

## Testing Flow

### Step 1: Health Check

```
GET http://localhost:5000/health
```

### Step 2: Create Contributor

```
POST http://localhost:5000/api/auth/signup
```

```json
{
  "name": "Test Contributor",
  "email": "contributor@test.com",
  "password": "contributor123",
  "role": "contributor"
}
```

### Step 3: Login as Contributor

```
POST http://localhost:5000/api/auth/login
```

```json
{
  "email": "contributor@test.com",
  "password": "contributor123"
}
```

Copy the returned token.

### Step 4: Create Issue

```
POST http://localhost:5000/api/issues
Authorization: CONTRIBUTOR_TOKEN
```

```json
{
  "title": "Login page crashes on invalid password",
  "description": "When a user enters an invalid password repeatedly, the login page returns a server error.",
  "type": "bug"
}
```

### Step 5: Get All Issues

```
GET http://localhost:5000/api/issues
```

### Step 6: Get Single Issue

```
GET http://localhost:5000/api/issues/1
```

### Step 7: Create Maintainer

```
POST http://localhost:5000/api/auth/signup
```

```json
{
  "name": "Test Maintainer",
  "email": "maintainer@test.com",
  "password": "maintainer123",
  "role": "maintainer"
}
```

### Step 8: Login as Maintainer

```
POST http://localhost:5000/api/auth/login
```

```json
{
  "email": "maintainer@test.com",
  "password": "maintainer123"
}
```

Copy the returned token.

### Step 9: Update Issue Status as Maintainer

```
PATCH http://localhost:5000/api/issues/1
Authorization: MAINTAINER_TOKEN
```

```json
{
  "status": "in_progress"
}
```

### Step 10: Confirm Contributor Cannot Update Non-Open Issue

```
PATCH http://localhost:5000/api/issues/1
Authorization: CONTRIBUTOR_TOKEN
```

```json
{
  "title": "Contributor trying to update non-open issue"
}
```

Expected: `409 Conflict`

### Step 11: Access Metrics as Maintainer

```
GET http://localhost:5000/api/metrics/internal
Authorization: MAINTAINER_TOKEN
```

### Step 12: Confirm Contributor Cannot Access Metrics

```
GET http://localhost:5000/api/metrics/internal
Authorization: CONTRIBUTOR_TOKEN
```

Expected: `403 Forbidden`

### Step 13: Delete Issue as Maintainer

```
DELETE http://localhost:5000/api/issues/1
Authorization: MAINTAINER_TOKEN
```

Expected: `200 OK`

---

## Validation Checklist

**Auth**
- Signup requires name
- Signup requires valid email
- Signup blocks duplicate email with 400
- Signup hashes password before storing
- Signup never returns password in response
- Login rejects wrong email with 401
- Login rejects wrong password with 401
- Login returns JWT token
- JWT payload includes `id`, `name`, and `role`

**Issues**
- Authenticated user can create issue
- Public user can view all issues
- Public user can view single issue
- Invalid issue ID returns 400
- Missing issue returns 404
- Contributor can update own open issue
- Contributor cannot update another user's issue (403)
- Contributor cannot update issue status (403)
- Contributor cannot update non-open issue (409)
- Maintainer can update any issue
- Maintainer can update status
- Maintainer can delete any issue
- Contributor cannot delete issue (403)

**Metrics**
- No token returns 401
- Contributor token returns 403
- Maintainer token returns 200
- Metrics totals reflect actual database records
