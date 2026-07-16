"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { EmployeeDto } from "@ems/shared";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch } from "@/lib/api";

export default function EmployeeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [employee, setEmployee] = useState<EmployeeDto | null>(null);
  const [reportees, setReportees] = useState<EmployeeDto[]>([]);

  useEffect(() => {
    apiFetch<{ employee: EmployeeDto }>(`/employees/${id}`).then((payload) => setEmployee(payload.employee));
    apiFetch<{ data: EmployeeDto[] }>(`/employees/${id}/reportees`).then((payload) => setReportees(payload.data));
  }, [id]);

  return (
    <AppShell>
      <PageHeader
        title={employee?.name ?? "Employee"}
        eyebrow={employee?.employeeId}
        actions={
          <Link className="btn btn-primary" href={`/employees/${id}/edit`}>
            Edit Profile
          </Link>
        }
      />
      {employee ? (
        <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <section className="panel p-5">
            <dl className="grid gap-4 sm:grid-cols-2">
              {[
                ["Email", employee.email],
                ["Phone", employee.phone],
                ["Department", employee.department],
                ["Designation", employee.designation],
                ["Salary", employee.salary ? employee.salary.toLocaleString() : "Restricted"],
                ["Joining Date", employee.joiningDate],
                ["Status", employee.status],
                ["Role", employee.role.replaceAll("_", " ")],
                ["Reporting Manager", employee.reportingManagerName ?? "None"]
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-sm font-bold text-[var(--muted)]">{label}</dt>
                  <dd className="mt-1 font-bold">{value}</dd>
                </div>
              ))}
            </dl>
          </section>
          <section className="panel p-5">
            <h3 className="mb-3 text-lg font-black">Direct Reports</h3>
            {reportees.length ? (
              <ul className="grid gap-2">
                {reportees.map((reportee) => (
                  <li key={reportee.id}>
                    <Link className="font-bold text-[var(--accent)]" href={`/employees/${reportee.id}`}>
                      {reportee.name}
                    </Link>
                    <p className="text-sm text-[var(--muted)]">{reportee.designation}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-[var(--muted)]">No direct reports.</p>
            )}
          </section>
        </div>
      ) : (
        <p>Loading employee...</p>
      )}
    </AppShell>
  );
}
