"use client";

import { AppShell } from "@/components/AppShell";
import { EmployeeForm } from "@/components/EmployeeForm";
import { PageHeader } from "@/components/PageHeader";

export default function NewEmployeePage() {
  return (
    <AppShell>
      <PageHeader title="Add Employee" eyebrow="Employee Management" />
      <EmployeeForm />
    </AppShell>
  );
}
