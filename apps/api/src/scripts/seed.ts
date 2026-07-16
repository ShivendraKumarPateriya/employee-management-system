import bcrypt from "bcryptjs";
import { pool, query } from "../db/pool.js";

const password = "Password123!";

async function upsertEmployee(input: {
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: "ACTIVE" | "INACTIVE";
  role: "SUPER_ADMIN" | "HR_MANAGER" | "EMPLOYEE";
  managerEmail?: string;
}) {
  const passwordHash = await bcrypt.hash(password, 12);
  const manager = input.managerEmail
    ? await query<{ id: string }>("SELECT id FROM employees WHERE email = $1", [input.managerEmail])
    : { rows: [] };

  await query(
    `
      INSERT INTO employees (
        employee_id, name, email, phone, department, designation, salary, joining_date,
        status, role, reporting_manager_id, password_hash
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      ON CONFLICT (email) DO UPDATE SET
        employee_id = EXCLUDED.employee_id,
        name = EXCLUDED.name,
        phone = EXCLUDED.phone,
        department = EXCLUDED.department,
        designation = EXCLUDED.designation,
        salary = EXCLUDED.salary,
        joining_date = EXCLUDED.joining_date,
        status = EXCLUDED.status,
        role = EXCLUDED.role,
        reporting_manager_id = EXCLUDED.reporting_manager_id,
        deleted_at = NULL
    `,
    [
      input.employeeId,
      input.name,
      input.email,
      input.phone,
      input.department,
      input.designation,
      input.salary,
      input.joiningDate,
      input.status,
      input.role,
      manager.rows[0]?.id ?? null,
      passwordHash
    ]
  );
}

async function main() {
  await upsertEmployee({
    employeeId: "EMS-001",
    name: "Aarav Sharma",
    email: "admin@ems.local",
    phone: "+91 98765 00001",
    department: "Executive",
    designation: "Super Admin",
    salary: 2500000,
    joiningDate: "2021-01-15",
    status: "ACTIVE",
    role: "SUPER_ADMIN"
  });
  await upsertEmployee({
    employeeId: "EMS-002",
    name: "Meera Iyer",
    email: "hr@ems.local",
    phone: "+91 98765 00002",
    department: "People",
    designation: "HR Manager",
    salary: 1500000,
    joiningDate: "2021-06-01",
    status: "ACTIVE",
    role: "HR_MANAGER",
    managerEmail: "admin@ems.local"
  });
  await upsertEmployee({
    employeeId: "EMS-003",
    name: "Kabir Khan",
    email: "employee@ems.local",
    phone: "+91 98765 00003",
    department: "Engineering",
    designation: "Frontend Engineer",
    salary: 950000,
    joiningDate: "2022-03-18",
    status: "ACTIVE",
    role: "EMPLOYEE",
    managerEmail: "hr@ems.local"
  });
  await upsertEmployee({
    employeeId: "EMS-004",
    name: "Naina Kapoor",
    email: "naina@ems.local",
    phone: "+91 98765 00004",
    department: "Engineering",
    designation: "Backend Engineer",
    salary: 1100000,
    joiningDate: "2023-08-07",
    status: "INACTIVE",
    role: "EMPLOYEE",
    managerEmail: "hr@ems.local"
  });

  console.log(`Seed complete. All demo users use password: ${password}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
