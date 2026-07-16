"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Plus, Search, SlidersHorizontal, Trash2, Upload } from "lucide-react";
import type { EmployeeDto } from "@ems/shared";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { apiFetch, toQuery } from "@/lib/api";
import { canCreateEmployee, canDeleteEmployee } from "@/lib/permissions";

export default function EmployeesPage() {
  const [user, setUser] = useState<EmployeeDto | null>(null);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ search: "", department: "", role: "", status: "", sortBy: "name", sortOrder: "asc", page: 1 });
  const [message, setMessage] = useState("");

  function load() {
    apiFetch<{ user: EmployeeDto }>("/auth/me").then((payload) => setUser(payload.user));
    apiFetch<{ data: EmployeeDto[]; total: number }>(`/employees${toQuery({ ...filters, pageSize: 10 })}`).then((payload) => {
      setEmployees(payload.data);
      setTotal(payload.total);
    });
  }

  useEffect(() => {
    load();
  }, [filters]);

  async function remove(id: string) {
    if (!confirm("Soft delete this employee?")) return;
    await apiFetch(`/employees/${id}`, { method: "DELETE" });
    setMessage("Employee deleted.");
    load();
  }

  async function importCsv(file: File) {
    const formData = new FormData();
    formData.set("file", file);
    const result = await apiFetch<{ created: EmployeeDto[]; errors: { row: number; message: string }[] }>("/employees/import-csv", {
      method: "POST",
      body: formData
    });
    setMessage(`Imported ${result.created.length} employees. ${result.errors.length} rows had errors.`);
    load();
  }

  return (
    <AppShell>
      <PageHeader
        title="Employees"
        eyebrow={`${total} active records`}
        actions={
          <>
            {user && canCreateEmployee(user.role) ? (
              <Link className="btn btn-primary" href="/employees/new">
                <Plus size={18} /> Add Employee
              </Link>
            ) : null}
            {user && canCreateEmployee(user.role) ? (
              <label className="btn btn-secondary cursor-pointer">
                <Upload size={18} /> Import CSV
                <input className="hidden" type="file" accept=".csv" onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])} />
              </label>
            ) : null}
            <button className="btn btn-secondary">
              <Download size={18} /> Export
            </button>
          </>
        }
      />

      <section className="panel hero-gradient mb-4 p-4 lg:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Search and refine</p>
            <h3 className="section-title text-2xl">People directory</h3>
          </div>
          <span className="badge">
            <SlidersHorizontal size={12} />
            Live filters
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-[2fr_1fr_1fr_1fr_1fr]">
        <label className="label">
          Search
          <span className="relative">
            <Search className="absolute left-3 top-3.5 text-[var(--muted)]" size={16} />
            <input className="field pl-9" placeholder="Name or email" value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })} />
          </span>
        </label>
        <label className="label">
          Department
          <input className="field" placeholder="Engineering" value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value, page: 1 })} />
        </label>
        <label className="label">
          Role
          <select className="field" value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value, page: 1 })}>
            <option value="">All</option>
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="EMPLOYEE">Employee</option>
          </select>
        </label>
        <label className="label">
          Status
          <select className="field" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">All</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label className="label">
          Sort
          <select className="field" value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}>
            <option value="name">Name</option>
            <option value="joiningDate">Joining Date</option>
          </select>
        </label>
        </div>
      </section>

      {message ? <p className="mb-4 rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-3 font-bold shadow-sm">{message}</p> : null}

      <section className="panel table-wrap overflow-hidden">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Department</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joining</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>
                  <Link className="display text-lg font-bold text-[var(--foreground)]" href={`/employees/${employee.id}`}>
                    {employee.name}
                  </Link>
                  <p className="mt-1 text-sm text-[var(--muted)]">{employee.email}</p>
                </td>
                <td>{employee.department}</td>
                <td>
                  <span className="badge">{employee.role.replaceAll("_", " ")}</span>
                </td>
                <td>
                  <span className={`badge ${employee.status === "ACTIVE" ? "status-active" : "status-inactive"}`}>{employee.status}</span>
                </td>
                <td>{employee.joiningDate}</td>
                <td>
                  <div className="flex gap-2">
                    <Link className="btn btn-secondary" href={`/employees/${employee.id}/edit`}>
                      Edit
                    </Link>
                    {user && canDeleteEmployee(user.role) ? (
                      <button className="btn btn-danger" onClick={() => remove(employee.id)} aria-label={`Delete ${employee.name}`}>
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <div className="mt-4 flex items-center justify-between">
        <button className="btn btn-secondary" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>
          <ChevronLeft size={16} /> Previous
        </button>
        <p className="badge">Page {filters.page}</p>
        <button className="btn btn-secondary" disabled={filters.page * 10 >= total} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>
          Next <ChevronRight size={16} />
        </button>
      </div>
    </AppShell>
  );
}
