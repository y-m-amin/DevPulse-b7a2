# DevPulse
### Internal Tech Issue & Feature Tracker API

A backend API for software teams to report bugs, suggest feature requests, and coordinate issue resolution.

This project uses Node.js, TypeScript, Express.js, PostgreSQL through Neon DB, JWT authentication, role-based authorization, bcrypt password hashing, and raw SQL through the native `pg` driver.

---

## Features

- User registration and login
- JWT-based authentication
- Role-based authorization
- Contributor and maintainer roles
- Create bug reports and feature requests
- Public issue listing and issue details
- Maintainer-only issue deletion
- Maintainer-only internal metrics
- Raw SQL queries using `pool.query()`
- Neon PostgreSQL database support

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js | Runtime |
| TypeScript | Type-safe JavaScript |
| Express.js | API framework |
| PostgreSQL | Relational database |
| Neon DB | Serverless PostgreSQL hosting |
| pg | Native PostgreSQL driver |
| bcrypt | Password hashing |
| jsonwebtoken | JWT creation and verification |
| dotenv | Environment variable loading |
| helmet | Basic API security headers |
| cors | Cross-origin request support |
| morgan | HTTP request logging |
| http-status-codes | Standard HTTP status references |

---

## Project Structure

```txt
internal-tech-tracker-api/
│
├── src/
│   ├── config/
│   │   ├── env.ts
│   │   └── db.ts
│   │
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── not-found.middleware.ts
│   │
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   │
│   │   ├── issues/
│   │   │   ├── issues.controller.ts
│   │   │   ├── issues.routes.ts
│   │   │   ├── issues.service.ts
│   │   │   └── issues.validation.ts
│   │   │
│   │   └── metrics/
│   │       ├── metrics.controller.ts
│   │       ├── metrics.routes.ts
│   │       └── metrics.service.ts
│   │
│   ├── sql/
│   │   └── schema.sql
│   │
│   ├── types/
│   │   └── express.d.ts
│   │
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── app-error.ts
│   │   ├── async-handler.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .env.example
├── .gitignore
├── API_DOCS.md
├── package.json
├── README.md
└── tsconfig.json
```

Requirements

Install the following before running the project:

Node.js 24.x or higher
npm
Neon PostgreSQL database
Thunder Client, Postman, or another API client
Installation

Clone the project:
```
git clone <your-repository-url>
cd internal-tech-tracker-api
```
Install dependencies:
```
npm install
```
Environment Variables

Create a .env file in the project root:
```
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://YOUR_NEON_USER:YOUR_NEON_PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require&channel_binding=require

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10
```
Create .env.example for reference:
```
NODE_ENV=development
PORT=5000
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
BCRYPT_SALT_ROUNDS=10
```
Never commit the real .env file.

Database Setup

This project uses Neon PostgreSQL.

Run the SQL schema from:
```
src/sql/schema.sql
```
You can run it using the Neon SQL Editor.

Tables

The database contains two main tables:

users
issues
Important Database Rules
Passwords are stored as bcrypt hashes.
Issue reporter_id is validated through application logic.
No SQL foreign key constraint is required for reporter_id.
No SQL JOINs are used in the application.
Reporter details are fetched separately from issues.
Run the Project

Development mode:
```
npm run dev
```
Build TypeScript:
```
npm run build
```
Run production build:
```
npm start
Health Check
GET /health
```
Example:
```
http://localhost:5000/health

Response:

{
  "success": true,
  "message": "API is running"
}
```
User Roles
Contributor

A contributor can:

Register
Login
Create issues
View all issues
View a single issue
Update their own open issue

A contributor cannot:

Update another user's issue
Update issue status
Update resolved or in-progress issues
Delete issues
Access internal metrics
Maintainer

A maintainer can:

Do everything a contributor can
Update any issue
Update issue status
Delete any issue
Access internal metrics
Authentication

After login, the API returns a JWT token.

Protected endpoints require the token in the request header:
```
Authorization: <JWT_TOKEN>
```
The API also supports:
```
Authorization: Bearer <JWT_TOKEN>
Main API Modules
Module	Base Route
Auth	/api/auth
Issues	/api/issues
Metrics	/api/metrics
```
Detailed endpoint documentation is available in:

API_DOCS.md
Standard Success Response
```
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```
Some GET endpoints may return:
```
{
  "success": true,
  "data": []
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
Useful Test Accounts

Create these through the signup endpoint.

Contributor
```
{
  "name": "Test Contributor",
  "email": "contributor@test.com",
  "password": "contributor123",
  "role": "contributor"
}
```
Maintainer
```
{
  "name": "Test Maintainer",
  "email": "maintainer@test.com",
  "password": "maintainer123",
  "role": "maintainer"
}
```
Development Notes

This project intentionally avoids:

ORMs
Query builders
SQL JOINs

Use only raw SQL through:

pool.query()

When related data is required, fetch records separately in application logic.

Example:

- Fetch issues.
- Extract reporter IDs.
- Fetch users by IDs.
- Map reporter data to issues in TypeScript.
- Recommended Testing Flow
- Start server.
- Test /health.
- Signup contributor.
- Login contributor.
- Create issue.
- Get all issues.
- Get single issue.
- Signup maintainer.
- Login maintainer.
- Update issue status as maintainer.
- Delete issue as maintainer.
- Test internal metrics as maintainer.
- Confirm contributor cannot access maintainer-only endpoints.