import { z } from "zod";

export const ROLES = ["SUPER_ADMIN", "HR_MANAGER", "EMPLOYEE"] as const;
export const STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type Role = (typeof ROLES)[number];
export type EmployeeStatus = (typeof STATUSES)[number];

export const employeeBaseSchema = z.object({
  employeeId: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().regex(/^[+]?[0-9 ()-]{7,20}$/, "Invalid phone number"),
  department: z.string().min(2).max(80),
  designation: z.string().min(2).max(100),
  salary: z.coerce.number().positive(),
  joiningDate: z.coerce.date(),
  status: z.enum(STATUSES),
  role: z.enum(ROLES),
  reportingManagerId: z.string().uuid().nullable().optional(),
  profileImageUrl: z.string().url().nullable().optional()
});

export const createEmployeeSchema = employeeBaseSchema.extend({
  password: z.string().min(8).max(128)
});

export const updateEmployeeSchema = employeeBaseSchema.partial().extend({
  password: z.string().min(8).max(128).optional()
});

export const employeeSelfUpdateSchema = z.object({
  phone: employeeBaseSchema.shape.phone.optional(),
  profileImageUrl: z.string().url().nullable().optional(),
  password: z.string().min(8).max(128).optional()
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const employeeQuerySchema = z.object({
  search: z.string().optional(),
  department: z.string().optional(),
  role: z.enum(ROLES).optional(),
  status: z.enum(STATUSES).optional(),
  sortBy: z.enum(["name", "joiningDate"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc"),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(10)
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type EmployeeQueryInput = z.infer<typeof employeeQuerySchema>;

export interface EmployeeDto {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary?: number;
  joiningDate: string;
  status: EmployeeStatus;
  role: Role;
  reportingManagerId: string | null;
  reportingManagerName?: string | null;
  profileImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
