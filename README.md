# Employee Management System

A full-stack Employee Management System built from the provided hiring assignment.

## Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, Recharts, Lucide icons
- Backend: Node.js, Express.js, TypeScript
- Database: PostgreSQL
- Database access: `node-postgres/pg` with SQL migration files
- Authentication: JWT in httpOnly cookies and bcrypt password hashing
- Bonus features: pagination, soft delete, CSV import, dashboard charts, dark mode, Docker, tests, and deployment notes

## Features

- Secure login, logout, and current-user session endpoint
- Protected frontend routes
- Role-based access control:
  - Super Admin: full access, role assignment, manager assignment, CRUD, delete
  - HR Manager: create/edit/view employees, no delete, no Super Admin assignment
  - Employee: view and edit own profile only, limited fields
- Employee CRUD with profile image URL support
- Soft delete through `deleted_at`
- Search by name/email
- Filter by department, role, and status
- Sort by name or joining date
- Pagination
- Organization tree and direct reportees
- Circular reporting prevention
- Dashboard metrics and charts
- CSV import with row-level errors
- API documentation at `/api/docs`

## Local Setup

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start PostgreSQL:

```bash
docker compose up -d postgres
```

4. Run migrations and seed data:

```bash
npm run migrate
npm run seed
```

5. Start both apps:

```bash
npm run dev
```

Frontend: `http://localhost:3000`

Backend: `http://localhost:4000`

API docs: `http://localhost:4000/api/docs`

## Demo Users

All seeded users use this password:

```txt
Password123!
```

| Role | Email |
| --- | --- |
| Super Admin | `admin@ems.local` |
| HR Manager | `hr@ems.local` |
| Employee | `employee@ems.local` |

## CSV Import Format

Upload a `.csv` file from the Employees page with these columns:

```csv
employeeId,name,email,phone,department,designation,salary,joiningDate,status,role,reportingManagerId,password
EMS-010,Riya Sen,riya@ems.local,+91 98765 00100,Design,Product Designer,900000,2024-02-01,ACTIVE,EMPLOYEE,,Password123!
```

`reportingManagerId`, `profileImageUrl`, and `password` are optional. If password is missing, the API uses `Password123!`.

## API Summary

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/employees`
- `POST /api/employees`
- `GET /api/employees/:id`
- `PUT /api/employees/:id`
- `DELETE /api/employees/:id`
- `PATCH /api/employees/:id/manager`
- `GET /api/employees/:id/reportees`
- `POST /api/employees/import-csv`
- `GET /api/organization/tree`
- `GET /api/dashboard/summary`
- `GET /api/dashboard/charts`

## Docker

Run the full stack:

```bash
cp .env.example .env
docker compose up --build
```

Then run migrations and seed inside the API container:

```bash
docker compose exec api npm run migrate --workspace apps/api
docker compose exec api npm run seed --workspace apps/api
```

## Tests And Checks

```bash
npm run test
npm run build
```

The backend includes tests for RBAC middleware and organization tree building. The frontend includes tests for role permission helpers.

## Deployment Notes

Recommended deployment split:

- Frontend: Vercel
- Backend: Render, Railway, or Fly.io
- PostgreSQL: Neon, Supabase, Railway, or Render PostgreSQL

Production environment variables:

- `DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `COOKIE_NAME`
- `API_PORT`
- `WEB_ORIGIN`
- `NEXT_PUBLIC_API_URL`

For production cookies, keep HTTPS enabled and set `WEB_ORIGIN` to the deployed frontend URL.
