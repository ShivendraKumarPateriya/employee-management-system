import type { Role } from "@ems/shared";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface EmployeeRow {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: string;
  joining_date: Date | string;
  status: "ACTIVE" | "INACTIVE";
  role: Role;
  reporting_manager_id: string | null;
  reporting_manager_name?: string | null;
  profile_image_url: string | null;
  password_hash: string;
  deleted_at: Date | string | null;
  created_at: Date | string;
  updated_at: Date | string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
