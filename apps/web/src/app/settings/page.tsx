"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";

export default function SettingsPage() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(localStorage.getItem("ems_dark") === "true");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("ems_dark", String(next));
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <AppShell>
      <PageHeader title="Settings" eyebrow="Preferences" />
      <section className="panel flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-black">Dark Mode</h3>
          <p className="text-[var(--muted)]">Persist the theme preference in this browser.</p>
        </div>
        <button className="btn btn-primary" onClick={toggle}>
          {dark ? <Sun size={18} /> : <Moon size={18} />} {dark ? "Use Light Mode" : "Use Dark Mode"}
        </button>
      </section>
    </AppShell>
  );
}
