# DevPulse

Internal Tech Issue & Feature Tracker API

A backend API for software teams to report bugs, suggest feature requests, and coordinate issue resolution.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js 24.x+ | Runtime |
| TypeScript | Type-safe JavaScript |
| Express.js | API framework |
| PostgreSQL | Relational database |
| Neon DB | Serverless PostgreSQL hosting |
| pg | Native PostgreSQL driver |
| bcrypt | Password hashing |
| jsonwebtoken | JWT creation and verification |
| dotenv | Environment variable loading |
| helmet | Security headers |
| cors | Cross-origin request support |
| morgan | HTTP request logging |
| http-status-codes | Standard HTTP status references |

---

## Project Structure

```
devpulse/
├── src/
│   ├── config/
│   │   ├── db.ts
│   │   └── env.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── role.middleware.ts
│   │   ├── error.middleware.ts
│   │   └── not-found.middleware.ts
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.validation.ts
│   │   ├── issues/
│   │   │   ├── issues.controller.ts
│   │   │   ├── issues.routes.ts
│   │   │   ├── issues.service.ts
│   │   │   └── issues.validation.ts
│   │   └── metrics/
│   │       ├── metrics.controller.ts
│   │       ├── metrics.routes.ts
│   │       └── metrics.service.ts
│   ├── sql/
│   │   └── schema.sql
│   ├── types/
│   │   └── express.d.ts
│   ├── utils/
│   │   ├── api-response.ts
│   │   ├── app-error.ts
│   │   ├── async-handler.ts
│   │   ├── jwt.ts
│   │   └── password.ts
│   ├── app.ts
│   └── server.ts
├── .env
├── .env.example
├── .gitignore
├── API_DOCS.md
├── package.json
├── README.md
└── tsconfig.json
```

---

## Requirements

- Node.js 24.x or higher
- npm
- Neon PostgreSQL database
- Thunder Client, Postman, or another API client

---

## Installation

Clone the project:

```bash
git clone https://github.com/y-m-amin/DevPulse-b7a2
cd DevPulse-b7a2
```

Install dependencies:

```bash
npm install
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
NODE_ENV=development
PORT=5000

DATABASE_URL=postgresql://YOUR_NEON_USER:YOUR_NEON_PASSWORD@YOUR_NEON_HOST/YOUR_DB?sslmode=require&channel_binding=require

JWT_SECRET=replace_this_with_a_long_random_secret
JWT_EXPIRES_IN=7d

BCRYPT_SALT_ROUNDS=10
```

A `.env.example` is included for reference. Never commit the real `.env` file.

---

## Database Setup

This project uses Neon PostgreSQL. Run the schema from `src/sql/schema.sql` using the Neon SQL Editor.

The schema creates two tables: `users` and `issues`.

Key rules:
- Passwords are stored as bcrypt hashes and never returned in responses
- `reporter_id` is validated in application logic — no foreign key constraint required
- No SQL JOINs are used; reporter details are fetched separately and merged in TypeScript

---

## Running the Project

```bash
# Development mode
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start
```

### Health Check

```
GET /health
```

```json
{
  "success": true,
  "message": "API is running"
}
```

---

## User Roles

### Contributor

- Register and log in
- Create issues (bug or feature request)
- View all issues and single issue details
- Update their own issue when status is `open`

Cannot: update another user's issue, update issue status, delete issues, or access metrics.

### Maintainer

- All contributor permissions
- Update any issue including status
- Delete any issue
- Access internal system metrics

---

## Authentication

After login, attach the returned JWT to protected requests:

```
Authorization: <JWT_TOKEN>
```

Bearer format is also supported:

```
Authorization: Bearer <JWT_TOKEN>
```

---

## API Modules

| Module | Base Route |
|---|---|
| Auth | `/api/auth` |
| Issues | `/api/issues` |
| Metrics | `/api/metrics` |

Full endpoint documentation is in `API_DOCS.md`.

---

## Response Format

Success:

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Error description",
  "errors": "Optional error details"
}
```

---

## Test Accounts

Create these via the signup endpoint.

**Contributor**

```json
{
  "name": "Test Contributor",
  "email": "contributor@test.com",
  "password": "contributor123",
  "role": "contributor"
}
```

**Maintainer**

```json
{
  "name": "Test Maintainer",
  "email": "maintainer@test.com",
  "password": "maintainer123",
  "role": "maintainer"
}
```

---

## Development Notes

This project intentionally avoids ORMs, query builders, and SQL JOINs. All database access uses raw `pool.query()` calls.

When related data is needed (e.g. reporter details on issues), the pattern is:
1. Fetch issues
2. Extract unique reporter IDs
3. Fetch users with `WHERE id = ANY($1::int[])`
4. Map reporter data onto issues in TypeScript
