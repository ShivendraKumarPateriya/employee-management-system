"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, Building2, ShieldCheck, Users2 } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { apiFetch } from "@/lib/api";

interface Summary {
  total_employees: number;
  active_employees: number;
  inactive_employees: number;
  department_count: number;
}

interface ChartPoint {
  label: string;
  value: number;
}

const colors = ["#0f766e", "#2563eb", "#c2410c", "#7c3aed", "#be123c"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [charts, setCharts] = useState<{ status: ChartPoint[]; department: ChartPoint[]; role: ChartPoint[] } | null>(null);

  useEffect(() => {
    Promise.all([
      apiFetch<Summary>("/dashboard/summary"),
      apiFetch<{ status: ChartPoint[]; department: ChartPoint[]; role: ChartPoint[] }>("/dashboard/charts")
    ]).then(([summaryPayload, chartPayload]) => {
      setSummary(summaryPayload);
      setCharts(chartPayload);
    });
  }, []);

  return (
    <AppShell>
      <PageHeader title="Dashboard" eyebrow="Overview" />
      <section className="panel hero-gradient mb-6 overflow-hidden p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.9fr]">
          <div>
            <span className="badge">
              <ShieldCheck size={12} />
              Secure people workspace
            </span>
            <h3 className="display mt-4 max-w-2xl text-4xl font-bold leading-tight">Track your workforce, reporting structure, and role access from a single operating view.</h3>
            <p className="mt-3 max-w-2xl text-[var(--muted)]">
              Keep an eye on team distribution, employee status, and organizational ownership without digging through separate screens.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            <div className="panel panel-strong p-4">
              <div className="flex items-center justify-between">
                <span className="badge">
                  <Users2 size={12} />
                  Workforce
                </span>
                <ArrowUpRight size={16} className="text-[var(--accent)]" />
              </div>
              <p className="display mt-5 text-4xl font-bold">{summary?.total_employees ?? "..."}</p>
              <p className="mt-1 text-sm text-[var(--muted)]">People tracked in the current EMS workspace.</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
              <div className="panel panel-strong p-4">
                <Building2 size={18} className="text-[var(--secondary)]" />
                <p className="display mt-4 text-3xl font-bold">{summary?.department_count ?? "..."}</p>
                <p className="text-sm text-[var(--muted)]">Departments</p>
              </div>
              <div className="panel panel-strong p-4">
                <ShieldCheck size={18} className="text-[var(--accent)]" />
                <p className="display mt-4 text-3xl font-bold">{summary?.active_employees ?? "..."}</p>
                <p className="text-sm text-[var(--muted)]">Active staff</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Employees" value={summary?.total_employees ?? "..."} />
        <StatCard label="Active Employees" value={summary?.active_employees ?? "..."} />
        <StatCard label="Inactive Employees" value={summary?.inactive_employees ?? "..."} />
        <StatCard label="Departments" value={summary?.department_count ?? "..."} />
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Distribution</p>
              <h3 className="section-title text-2xl">Employees by Department</h3>
            </div>
            <span className="badge">Bar view</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts?.department ?? []}>
                <XAxis dataKey="label" stroke="var(--muted)" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} stroke="var(--muted)" tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="var(--accent)" radius={[12, 12, 4, 4]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Access Mix</p>
              <h3 className="section-title text-2xl">Role Breakdown</h3>
            </div>
            <span className="badge">Pie view</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={charts?.role ?? []} dataKey="value" nameKey="label" outerRadius={110} label>
                  {(charts?.role ?? []).map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
