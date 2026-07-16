import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import { query } from "../db/pool.js";
import { buildTree } from "../services/hierarchy.js";

export const organizationRouter = Router();
organizationRouter.use(authenticate);

organizationRouter.get("/tree", async (_req, res, next) => {
  try {
    const result = await query<{
      id: string;
      employee_id: string;
      name: string;
      designation: string;
      department: string;
      role: string;
      reporting_manager_id: string | null;
    }>(
      `
        SELECT id, employee_id, name, designation, department, role, reporting_manager_id
        FROM employees
        WHERE deleted_at IS NULL
        ORDER BY name
      `
    );
    const tree = buildTree(
      result.rows.map((row) => ({
        id: row.id,
        employeeId: row.employee_id,
        name: row.name,
        designation: row.designation,
        department: row.department,
        role: row.role,
        reportingManagerId: row.reporting_manager_id
      }))
    );
    res.json({ tree });
  } catch (error) {
    next(error);
  }
});
