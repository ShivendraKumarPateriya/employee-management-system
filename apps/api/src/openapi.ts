export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Employee Management System API",
    version: "1.0.0",
    description: "Authentication, RBAC, employee management, organization hierarchy, dashboard, and CSV import APIs."
  },
  servers: [{ url: "http://localhost:4000/api" }],
  paths: {
    "/auth/login": {
      post: {
        summary: "Log in with email and password",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              example: { email: "admin@ems.local", password: "Password123!" }
            }
          }
        },
        responses: { "200": { description: "Authenticated user" }, "401": { description: "Invalid credentials" } }
      }
    },
    "/auth/logout": { post: { summary: "Clear the authentication cookie", responses: { "200": { description: "Logged out" } } } },
    "/auth/me": { get: { summary: "Get the current authenticated user", responses: { "200": { description: "Current user" } } } },
    "/employees": {
      get: {
        summary: "List employees",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          { name: "department", in: "query", schema: { type: "string" } },
          { name: "role", in: "query", schema: { type: "string", enum: ["SUPER_ADMIN", "HR_MANAGER", "EMPLOYEE"] } },
          { name: "status", in: "query", schema: { type: "string", enum: ["ACTIVE", "INACTIVE"] } },
          { name: "sortBy", in: "query", schema: { type: "string", enum: ["name", "joiningDate"] } },
          { name: "sortOrder", in: "query", schema: { type: "string", enum: ["asc", "desc"] } },
          { name: "page", in: "query", schema: { type: "integer" } },
          { name: "pageSize", in: "query", schema: { type: "integer" } }
        ],
        responses: { "200": { description: "Paginated employees" } }
      },
      post: {
        summary: "Create an employee",
        responses: { "201": { description: "Created employee" }, "403": { description: "Insufficient permissions" } }
      }
    },
    "/employees/{id}": {
      get: { summary: "Get one employee", responses: { "200": { description: "Employee" } } },
      put: { summary: "Update one employee", responses: { "200": { description: "Updated employee" } } },
      delete: { summary: "Soft delete one employee", responses: { "204": { description: "Deleted" } } }
    },
    "/employees/{id}/manager": {
      patch: {
        summary: "Assign reporting manager",
        responses: { "200": { description: "Updated employee" }, "400": { description: "Circular hierarchy rejected" } }
      }
    },
    "/employees/{id}/reportees": { get: { summary: "List direct reports", responses: { "200": { description: "Reportees" } } } },
    "/employees/import-csv": { post: { summary: "Import employees from CSV", responses: { "201": { description: "Imported" }, "207": { description: "Partial import" } } } },
    "/organization/tree": { get: { summary: "Get organization tree", responses: { "200": { description: "Tree" } } } },
    "/dashboard/summary": { get: { summary: "Get dashboard counts", responses: { "200": { description: "Summary" } } } },
    "/dashboard/charts": { get: { summary: "Get chart data", responses: { "200": { description: "Chart data" } } } }
  }
};
