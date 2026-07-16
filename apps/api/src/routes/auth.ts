import { Router } from "express";
import bcrypt from "bcryptjs";
import { loginSchema } from "@ems/shared";
import { query } from "../db/pool.js";
import { authenticate, clearAuthCookie, setAuthCookie, signToken } from "../middleware/auth.js";
import type { EmployeeRow } from "../types.js";
import { HttpError } from "../utils/http.js";
import { toEmployeeDto } from "../utils/employeeMapper.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const input = loginSchema.parse(req.body);
    const result = await query<EmployeeRow>(
      "SELECT * FROM employees WHERE email = $1 AND deleted_at IS NULL",
      [input.email.toLowerCase()]
    );
    const employee = result.rows[0];

    if (!employee || !(await bcrypt.compare(input.password, employee.password_hash))) {
      throw new HttpError(401, "Invalid email or password");
    }

    setAuthCookie(res, signToken(employee.id));
    res.json({ user: toEmployeeDto(employee, employee.role !== "EMPLOYEE") });
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", (_req, res) => {
  clearAuthCookie(res);
  res.json({ ok: true });
});

authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const result = await query<EmployeeRow>(
      "SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL",
      [req.user!.id]
    );
    res.json({ user: toEmployeeDto(result.rows[0], req.user!.role !== "EMPLOYEE") });
  } catch (error) {
    next(error);
  }
});
