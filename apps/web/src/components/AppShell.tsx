"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BarChart3, Bell, Building2, LogOut, Moon, Search, Settings, Sparkles, Sun, User, Users } from "lucide-react";
import type { EmployeeDto } from "@ems/shared";
import { apiFetch } from "@/lib/api";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/employees", label: "Employees", icon: Users },
  { href: "/organization", label: "Organization", icon: Building2 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<EmployeeDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const storedDark = localStorage.getItem("ems_dark") === "true";
    setDark(storedDark);
    document.documentElement.classList.toggle("dark", storedDark);

    apiFetch<{ user: EmployeeDto }>("/auth/me")
      .then((payload) => setUser(payload.user))
      .catch(() => router.replace("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ems_dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  }

  async function logout() {
    await apiFetch("/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (loading) {
    return <main className="grid min-h-screen place-items-center">Loading workspace...</main>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[320px_1fr]">
      <aside className="border-b border-[var(--border)] px-4 pb-4 pt-4 lg:min-h-screen lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
        <div className="panel hero-gradient soft-ring p-4 lg:p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">EMS Workspace</p>
              <h1 className="display mt-2 text-2xl font-bold">Employee Command</h1>
              <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">People operations, hierarchy, and employee records in one focused workspace.</p>
            </div>
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--panel-strong)] text-[var(--accent)] shadow-sm">
              <Sparkles size={18} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-2 lg:hidden">
          <button className="btn btn-secondary flex-1" onClick={toggleTheme} aria-label="Toggle dark mode">
            {dark ? <Sun size={18} /> : <Moon size={18} />} Theme
          </button>
          <button className="btn btn-secondary flex-1" onClick={logout}>
            <LogOut size={18} /> Logout
          </button>
        </div>

        <div className="mt-4 hidden items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)] px-4 py-3 text-sm text-[var(--muted)] lg:flex">
          <Search size={16} />
          Search employees, roles, and teams
        </div>

        <nav className="mt-4 flex gap-2 overflow-x-auto pb-2 lg:grid">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`btn justify-start whitespace-nowrap ${active ? "btn-primary" : "btn-secondary"}`}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 hidden lg:block">
          <div className="panel p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="display text-lg font-bold">{user.name}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">{user.role.replaceAll("_", " ")}</p>
              </div>
              <span className="badge">
                <Bell size={12} />
                Live
              </span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button className="btn btn-secondary" onClick={toggleTheme} aria-label="Toggle dark mode">
                {dark ? <Sun size={18} /> : <Moon size={18} />} Theme
              </button>
              <button className="btn btn-secondary" onClick={logout}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </div>
        </div>
      </aside>
      <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
    </div>
  );
}
