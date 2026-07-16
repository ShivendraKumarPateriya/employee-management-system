"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmployeeDto } from "@ems/shared";
import { AppShell } from "@/components/AppShell";
import { EmployeeForm } from "@/components/EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

export default function EditEmployeePage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [user, setUser] = useState<EmployeeDto | null>(null);

  useEffect(() => {
    apiFetch<{ employee: EmployeeDto }>(`/employees/${id}`).then((payload) => setEmployee(payload.employee));
    apiFetch<{ user: EmployeeDto }>("/auth/me").then((payload) => setUser(payload.user));
  }, [id]);

  return (
    <AppShell>
      <PageHeader title="Edit Employee" eyebrow={employee?.employeeId} />
      {employee && user ? <EmployeeForm employee={employee} selfOnly={user.role === "EMPLOYEE"} /> : <p>Loading employee...</p>}
    </AppShell>
  );
}
