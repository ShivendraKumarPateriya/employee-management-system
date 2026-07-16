"use client";

import { useEffect, useState } from "react";
import type { EmployeeDto } from "@ems/shared";
import { AppShell } from "@/components/AppShell";
import { EmployeeForm } from "@/components/EmployeeForm";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

export default function ProfilePage() {
  const [user, setUser] = useState<EmployeeDto | null>(null);

  useEffect(() => {
    apiFetch<{ user: EmployeeDto }>("/auth/me").then((payload) => setUser(payload.user));
  }, []);

  return (
    <AppShell>
      <PageHeader title="My Profile" eyebrow={user?.role.replaceAll("_", " ")} />
      {user ? <EmployeeForm employee={user} selfOnly={user.role === "EMPLOYEE"} /> : <p>Loading profile...</p>}
    </AppShell>
  );
}
