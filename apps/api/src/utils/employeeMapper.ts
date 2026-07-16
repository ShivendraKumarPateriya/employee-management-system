import type { EmployeeDto } from "@ems/shared";
import type { EmployeeRow } from "../types.js";

export function toEmployeeDto(row: EmployeeRow, includeSalary = true): EmployeeDto {
  const dto: EmployeeDto = {
    id: row.id,
    employeeId: row.employee_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    department: row.department,
    designation: row.designation,
    joiningDate: new Date(row.joining_date).toISOString().slice(0, 10),
    status: row.status,
    role: row.role,
    reportingManagerId: row.reporting_manager_id,
    reportingManagerName: row.reporting_manager_name ?? null,
    profileImageUrl: row.profile_image_url,
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString()
  };

  if (includeSalary) dto.salary = Number(row.salary);
  return dto;
}
