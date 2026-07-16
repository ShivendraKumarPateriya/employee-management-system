import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { Role } from "@ems/shared";
import { config, isProduction } from "../config.js";
import { query } from "../db/pool.js";
import { HttpError } from "../utils/http.js";
import type { EmployeeRow } from "../types.js";

interface JwtPayload {
  sub: string;
}

export function signToken(userId: string) {
  return jwt.sign({ sub: userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"]
  });
}

export function setAuthCookie(res: Response, token: string) {
  res.cookie(config.COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: 24 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(config.COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction
  });
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[config.COOKIE_NAME];
    if (!token) throw new HttpError(401, "Authentication required");

    const payload = jwt.verify(token, config.JWT_SECRET) as JwtPayload;
    const result = await query<EmployeeRow>(
      "SELECT * FROM employees WHERE id = $1 AND deleted_at IS NULL",
      [payload.sub]
    );
    const employee = result.rows[0];
    if (!employee) throw new HttpError(401, "Invalid session");

    req.user = {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role
    };
    next();
  } catch (error) {
    next(error instanceof HttpError ? error : new HttpError(401, "Invalid session"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, "Authentication required"));
    if (!roles.includes(req.user.role)) return next(new HttpError(403, "Insufficient permissions"));
    next();
  };
}
