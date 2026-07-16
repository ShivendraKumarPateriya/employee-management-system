import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db/pool.js";

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get("/summary", async (_req, res, next) => {
  try {
    const result = await query<{
      total_employees: string;
      active_employees: string;
      inactive_employees: string;
      department_count: string;
    }>(
      `
        SELECT
          COUNT(*)::int AS total_employees,
          COUNT(*) FILTER (WHERE status = 'ACTIVE')::int AS active_employees,
          COUNT(*) FILTER (WHERE status = 'INACTIVE')::int AS inactive_employees,
          COUNT(DISTINCT department)::int AS department_count
        FROM employees
        WHERE deleted_at IS NULL
      `
    );
    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
});

dashboardRouter.get("/charts", async (_req, res, next) => {
  try {
    const [status, department, role] = await Promise.all([
      query<{ label: string; value: string }>(
        "SELECT status AS label, COUNT(*)::int AS value FROM employees WHERE deleted_at IS NULL GROUP BY status ORDER BY status"
      ),
      query<{ label: string; value: string }>(
        "SELECT department AS label, COUNT(*)::int AS value FROM employees WHERE deleted_at IS NULL GROUP BY department ORDER BY department"
      ),
      query<{ label: string; value: string }>(
        "SELECT role AS label, COUNT(*)::int AS value FROM employees WHERE deleted_at IS NULL GROUP BY role ORDER BY role"
      )
    ]);

    res.json({
      status: status.rows,
      department: department.rows,
      role: role.rows
    });
  } catch (error) {
    next(error);
  }
});
