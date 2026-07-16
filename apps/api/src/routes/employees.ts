import { Router } from "express";
import bcrypt from "bcryptjs";
import multer from "multer";
import { parse } from "csv-parse/sync";
import {
  createEmployeeSchema,
  employeeQuerySchema,
  employeeSelfUpdateSchema,
  ROLES,
  updateEmployeeSchema,
  type CreateEmployeeInput,
  type Role
} from "@ems/shared";
import { authenticate, authorize } from "../middleware/auth.js";
import { query } from "../db/pool.js";
import type { EmployeeRow } from "../types.js";
import { HttpError, assertFound } from "../utils/http.js";
import { toEmployeeDto } from "../utils/employeeMapper.js";
import { assertValidManagerAssignment } from "../services/hierarchy.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });

export const employeesRouter = Router();
employeesRouter.use(authenticate);

const sortableColumns = {
  name: "e.name",
  joiningDate: "e.joining_date"
} as const;

function canSeeSalary(role: Role) {
  return role !== "EMPLOYEE";
}

async function findEmployee(id: string) {
  const result = await query<EmployeeRow>(
    `
      SELECT e.*, m.name AS reporting_manager_name
      FROM employees e
      LEFT JOIN employees m ON m.id = e.reporting_manager_id
      WHERE e.id = $1 AND e.deleted_at IS NULL
    `,
    [id]
  );
  return result.rows[0];
}

function enforceRoleWriteRules(actorRole: Role, targetRole?: Role) {
  if (actorRole === "HR_MANAGER" && targetRole === "SUPER_ADMIN") {
    throw new HttpError(403, "HR Manager cannot assign Super Admin role");
  }
}

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

function nullableString(value: unknown): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") throw new HttpError(400, "Value must be a string");
  return value;
}

function paramId(value: unknown) {
  if (typeof value !== "string") throw new HttpError(400, "Invalid employee id");
  return value;
}

employeesRouter.get("/", async (req, res, next) => {
  try {
    const input = employeeQuerySchema.parse(req.query);
    const params: unknown[] = [];
    const where = ["e.deleted_at IS NULL"];

    if (req.user!.role === "EMPLOYEE") {
      params.push(req.user!.id);
      where.push(`e.id = $${params.length}`);
    }
    if (input.search) {
      params.push(`%${input.search.toLowerCase()}%`);
      where.push(`(LOWER(e.name) LIKE $${params.length} OR LOWER(e.email) LIKE $${params.length})`);
    }
    for (const [field, value] of [
      ["department", input.department],
      ["role", input.role],
      ["status", input.status]
    ] as const) {
      if (value) {
        params.push(value);
        where.push(`e.${field} = $${params.length}`);
      }
    }

    const countResult = await query<{ count: string }>(
      `SELECT COUNT(*) FROM employees e WHERE ${where.join(" AND ")}`,
      params
    );

    params.push(input.pageSize, (input.page - 1) * input.pageSize);
    const result = await query<EmployeeRow>(
      `
        SELECT e.*, m.name AS reporting_manager_name
        FROM employees e
        LEFT JOIN employees m ON m.id = e.reporting_manager_id
        WHERE ${where.join(" AND ")}
        ORDER BY ${sortableColumns[input.sortBy]} ${input.sortOrder === "desc" ? "DESC" : "ASC"}
        LIMIT $${params.length - 1} OFFSET $${params.length}
      `,
      params
    );

    res.json({
      data: result.rows.map((row) => toEmployeeDto(row, canSeeSalary(req.user!.role))),
      page: input.page,
      pageSize: input.pageSize,
      total: Number(countResult.rows[0].count)
    });
  } catch (error) {
    next(error);
  }
});

employeesRouter.post("/", authorize("SUPER_ADMIN", "HR_MANAGER"), async (req, res, next) => {
  try {
    const input = createEmployeeSchema.parse(req.body);
    enforceRoleWriteRules(req.user!.role, input.role);
    await assertValidManagerAssignment("new", input.reportingManagerId ?? null);
    const passwordHash = await bcrypt.hash(input.password, 12);

    const result = await query<EmployeeRow>(
      `
        INSERT INTO employees (
          employee_id, name, email, phone, department, designation, salary, joining_date,
          status, role, reporting_manager_id, profile_image_url, password_hash
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
        RETURNING *
      `,
      [
        input.employeeId,
        input.name,
        input.email.toLowerCase(),
        input.phone,
        input.department,
        input.designation,
        input.salary,
        input.joiningDate,
        input.status,
        input.role,
        input.reportingManagerId ?? null,
        input.profileImageUrl ?? null,
        passwordHash
      ]
    );
    res.status(201).json({ employee: toEmployeeDto(result.rows[0]) });
  } catch (error) {
    next(error);
  }
});

employeesRouter.post("/import-csv", authorize("SUPER_ADMIN", "HR_MANAGER"), upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new HttpError(400, "CSV file is required");
    const rows = parse(req.file.buffer, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, string>[];
    const created = [];
    const errors = [];

    for (const [index, row] of rows.entries()) {
      try {
        const input = createEmployeeSchema.parse({
          employeeId: row.employeeId ?? row.employee_id,
          name: row.name,
          email: row.email,
          phone: row.phone,
          department: row.department,
          designation: row.designation,
          salary: row.salary,
          joiningDate: row.joiningDate ?? row.joining_date,
          status: row.status,
          role: row.role,
          reportingManagerId: row.reportingManagerId || null,
          profileImageUrl: row.profileImageUrl || null,
          password: row.password || "Password123!"
        });
        enforceRoleWriteRules(req.user!.role, input.role);
        await assertValidManagerAssignment("new", input.reportingManagerId ?? null);
        const passwordHash = await bcrypt.hash(input.password, 12);
        const result = await insertEmployee(input, passwordHash);
        created.push(toEmployeeDto(result));
      } catch (error) {
        errors.push({ row: index + 2, message: error instanceof Error ? error.message : "Invalid row" });
      }
    }

    res.status(errors.length ? 207 : 201).json({ created, errors });
  } catch (error) {
    next(error);
  }
});

employeesRouter.get("/:id", async (req, res, next) => {
  try {
    const id = paramId(req.params.id);
    if (req.user!.role === "EMPLOYEE" && req.user!.id !== id) {
      throw new HttpError(403, "Employees can only view their own profile");
    }
    const employee = assertFound(await findEmployee(id), "Employee not found");
    res.json({ employee: toEmployeeDto(employee, canSeeSalary(req.user!.role)) });
  } catch (error) {
    next(error);
  }
});

employeesRouter.put("/:id", async (req, res, next) => {
  try {
    const id = paramId(req.params.id);
    const isSelfEmployee = req.user!.role === "EMPLOYEE" && req.user!.id === id;
    if (req.user!.role === "EMPLOYEE" && !isSelfEmployee) {
      throw new HttpError(403, "Employees can only edit their own profile");
    }

    const input = isSelfEmployee
      ? employeeSelfUpdateSchema.parse(req.body)
      : updateEmployeeSchema.parse(req.body);
    const requestedRole = "role" in input && isRole(input.role) ? input.role : undefined;
    enforceRoleWriteRules(req.user!.role, requestedRole);

    if ("reportingManagerId" in input) {
      await assertValidManagerAssignment(id, nullableString(input.reportingManagerId));
    }

    const fields: string[] = [];
    const values: unknown[] = [];
    const add = (column: string, value: unknown) => {
      values.push(value);
      fields.push(`${column} = $${values.length}`);
    };

    const map: Record<string, string> = {
      employeeId: "employee_id",
      name: "name",
      email: "email",
      phone: "phone",
      department: "department",
      designation: "designation",
      salary: "salary",
      joiningDate: "joining_date",
      status: "status",
      role: "role",
      reportingManagerId: "reporting_manager_id",
      profileImageUrl: "profile_image_url"
    };

    for (const [key, column] of Object.entries(map)) {
      if (key in input) {
        const value = (input as Record<string, unknown>)[key];
        add(column, key === "email" && typeof value === "string" ? value.toLowerCase() : value);
      }
    }

    if ("password" in input && input.password) {
      add("password_hash", await bcrypt.hash(input.password, 12));
    }
    if (!fields.length) throw new HttpError(400, "No fields to update");

    values.push(id);
    const result = await query<EmployeeRow>(
      `UPDATE employees SET ${fields.join(", ")} WHERE id = $${values.length} AND deleted_at IS NULL RETURNING *`,
      values
    );
    res.json({ employee: toEmployeeDto(assertFound(result.rows[0], "Employee not found"), canSeeSalary(req.user!.role)) });
  } catch (error) {
    next(error);
  }
});

employeesRouter.delete("/:id", authorize("SUPER_ADMIN"), async (req, res, next) => {
  try {
    const result = await query<EmployeeRow>(
      "UPDATE employees SET deleted_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING *",
      [paramId(req.params.id)]
    );
    assertFound(result.rows[0], "Employee not found");
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

employeesRouter.patch("/:id/manager", authorize("SUPER_ADMIN", "HR_MANAGER"), async (req, res, next) => {
  try {
    const managerId = nullableString(req.body.reportingManagerId);
    const id = paramId(req.params.id);
    await assertValidManagerAssignment(id, managerId);
    const result = await query<EmployeeRow>(
      "UPDATE employees SET reporting_manager_id = $1 WHERE id = $2 AND deleted_at IS NULL RETURNING *",
      [managerId, id]
    );
    res.json({ employee: toEmployeeDto(assertFound(result.rows[0], "Employee not found")) });
  } catch (error) {
    next(error);
  }
});

employeesRouter.get("/:id/reportees", async (req, res, next) => {
  try {
    const result = await query<EmployeeRow>(
      "SELECT * FROM employees WHERE reporting_manager_id = $1 AND deleted_at IS NULL ORDER BY name",
      [paramId(req.params.id)]
    );
    res.json({ data: result.rows.map((row) => toEmployeeDto(row, canSeeSalary(req.user!.role))) });
  } catch (error) {
    next(error);
  }
});

async function insertEmployee(input: CreateEmployeeInput, passwordHash: string) {
  const result = await query<EmployeeRow>(
    `
      INSERT INTO employees (
        employee_id, name, email, phone, department, designation, salary, joining_date,
        status, role, reporting_manager_id, profile_image_url, password_hash
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *
    `,
    [
      input.employeeId,
      input.name,
      input.email.toLowerCase(),
      input.phone,
      input.department,
      input.designation,
      input.salary,
      input.joiningDate,
      input.status,
      input.role,
      input.reportingManagerId ?? null,
      input.profileImageUrl ?? null,
      passwordHash
    ]
  );
  return result.rows[0];
}
