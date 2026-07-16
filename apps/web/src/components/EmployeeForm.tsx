"use client";

import { Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import type { EmployeeDto, Role } from "@ems/shared";
import { apiFetch } from "@/lib/api";

const emptyEmployee = {
  employeeId: "",
  name: "",
  email: "",
  phone: "",
  department: "",
  designation: "",
  salary: "",
  joiningDate: new Date().toISOString().slice(0, 10),
  status: "ACTIVE",
  role: "EMPLOYEE",
  reportingManagerId: "",
  profileImageUrl: "",
  password: "Password123!"
};

export function EmployeeForm({ employee, selfOnly = false }: { employee?: EmployeeDto; selfOnly?: boolean }) {
  const [form, setForm] = useState<Record<string, string>>({
    ...emptyEmployee,
    ...(employee
      ? {
          employeeId: employee.employeeId,
          name: employee.name,
          email: employee.email,
          phone: employee.phone,
          department: employee.department,
          designation: employee.designation,
          salary: String(employee.salary ?? ""),
          joiningDate: employee.joiningDate,
          status: employee.status,
          role: employee.role,
          reportingManagerId: employee.reportingManagerId ?? "",
          profileImageUrl: employee.profileImageUrl ?? "",
          password: ""
        }
      : {})
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function setField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload: Record<string, unknown> = selfOnly
        ? {
            phone: form.phone,
            profileImageUrl: form.profileImageUrl || null,
            ...(form.password ? { password: form.password } : {})
          }
        : {
            employeeId: form.employeeId,
            name: form.name,
            email: form.email,
            phone: form.phone,
            department: form.department,
            designation: form.designation,
            salary: Number(form.salary),
            joiningDate: form.joiningDate,
            status: form.status,
            role: form.role as Role,
            reportingManagerId: form.reportingManagerId || null,
            profileImageUrl: form.profileImageUrl || null,
            ...(form.password ? { password: form.password } : {})
          };

      const path = employee ? `/employees/${employee.id}` : "/employees";
      await apiFetch(path, { method: employee ? "PUT" : "POST", body: JSON.stringify(payload) });
      router.push(employee ? `/employees/${employee.id}` : "/employees");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save employee");
    } finally {
      setSaving(false);
    }
  }

  const disabled = selfOnly;

  return (
    <form className="panel panel-strong grid gap-5 p-5 lg:p-6" onSubmit={submit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow">{employee ? "Update employee record" : "Create employee record"}</p>
          <h3 className="section-title mt-2 text-2xl">{selfOnly ? "Profile settings" : "Employee details"}</h3>
        </div>
        <span className="badge">{selfOnly ? "Limited self-edit mode" : "Admin edit mode"}</span>
      </div>
      {error ? <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="label">
          Employee ID
          <input className="field" placeholder="EMS-105" value={form.employeeId} disabled={disabled} onChange={(e) => setField("employeeId", e.target.value)} required />
        </label>
        <label className="label">
          Name
          <input className="field" placeholder="Full name" value={form.name} disabled={disabled} onChange={(e) => setField("name", e.target.value)} required />
        </label>
        <label className="label">
          Email
          <input className="field" type="email" placeholder="name@company.com" value={form.email} disabled={disabled} onChange={(e) => setField("email", e.target.value)} required />
        </label>
        <label className="label">
          Phone
          <input className="field" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setField("phone", e.target.value)} required />
        </label>
        <label className="label">
          Department
          <input className="field" placeholder="Engineering" value={form.department} disabled={disabled} onChange={(e) => setField("department", e.target.value)} required />
        </label>
        <label className="label">
          Designation
          <input className="field" placeholder="Backend Engineer" value={form.designation} disabled={disabled} onChange={(e) => setField("designation", e.target.value)} required />
        </label>
        <label className="label">
          Salary
          <input className="field" type="number" value={form.salary} disabled={disabled} onChange={(e) => setField("salary", e.target.value)} required />
        </label>
        <label className="label">
          Joining Date
          <input className="field" type="date" value={form.joiningDate} disabled={disabled} onChange={(e) => setField("joiningDate", e.target.value)} required />
        </label>
        <label className="label">
          Status
          <select className="field" value={form.status} disabled={disabled} onChange={(e) => setField("status", e.target.value)}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </label>
        <label className="label">
          Role
          <select className="field" value={form.role} disabled={disabled} onChange={(e) => setField("role", e.target.value)}>
            <option value="EMPLOYEE">Employee</option>
            <option value="HR_MANAGER">HR Manager</option>
            <option value="SUPER_ADMIN">Super Admin</option>
          </select>
        </label>
        <label className="label">
          Reporting Manager ID
          <input className="field" placeholder="UUID of the manager" value={form.reportingManagerId} disabled={disabled} onChange={(e) => setField("reportingManagerId", e.target.value)} />
        </label>
        <label className="label">
          Profile Image URL
          <input className="field" placeholder="https://..." value={form.profileImageUrl} onChange={(e) => setField("profileImageUrl", e.target.value)} />
        </label>
        <label className="label md:col-span-2">
          {employee ? "New Password" : "Password"}
          <input className="field" type="password" value={form.password} onChange={(e) => setField("password", e.target.value)} required={!employee} />
        </label>
      </div>
      <div className="flex justify-end">
        <button className="btn btn-primary" disabled={saving}>
          <Save size={18} /> {saving ? "Saving..." : "Save Employee"}
        </button>
      </div>
    </form>
  );
}
