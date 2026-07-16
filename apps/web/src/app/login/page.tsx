"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LogIn, ShieldCheck, Users2 } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("admin@ems.local");
  const [password, setPassword] = useState("Password123!");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const dark = localStorage.getItem("ems_dark") === "true";
    document.documentElement.classList.toggle("dark", dark);
  }, []);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log in");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4 lg:p-8">
      <section className="grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="panel hero-gradient flex flex-col justify-between p-6 lg:p-8">
          <div>
            <span className="badge">
              <ShieldCheck size={12} />
              Secure access
            </span>
            <p className="eyebrow mt-6">Employee Management System</p>
            <h1 className="display mt-3 max-w-xl text-5xl font-bold leading-tight">A cleaner way to run people operations, role access, and reporting structure.</h1>
            <p className="mt-4 max-w-xl text-base text-[var(--muted)]">Use the seeded demo accounts to test the complete admin, HR, and employee experience locally.</p>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="panel panel-strong p-4">
              <Users2 size={18} className="text-[var(--accent)]" />
              <p className="display mt-4 text-2xl font-bold">3</p>
              <p className="text-sm text-[var(--muted)]">roles ready to test</p>
            </div>
            <div className="panel panel-strong p-4">
              <ShieldCheck size={18} className="text-[var(--secondary)]" />
              <p className="display mt-4 text-2xl font-bold">RBAC</p>
              <p className="text-sm text-[var(--muted)]">guardrails built in</p>
            </div>
            <div className="panel panel-strong p-4">
              <ArrowRight size={18} className="text-[var(--accent)]" />
              <p className="display mt-4 text-2xl font-bold">Live</p>
              <p className="text-sm text-[var(--muted)]">local environment</p>
            </div>
          </div>
        </div>
        <div className="w-full">
        <form className="panel panel-strong grid gap-4 p-6 lg:p-7" onSubmit={submit}>
          <div>
            <p className="eyebrow">Welcome back</p>
            <h2 className="display mt-2 text-4xl font-bold">Sign in</h2>
            <p className="mt-2 text-[var(--muted)]">Use any seeded account below.</p>
          </div>
          {error ? <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p> : null}
          <label className="label">
            Email
            <input className="field" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label className="label">
            Password
            <input className="field" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          <button className="btn btn-primary" disabled={loading}>
            <LogIn size={18} /> {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <div className="mt-4 grid gap-3">
          <div className="panel p-4">
            <p className="text-sm font-bold text-[var(--muted)]">Super Admin</p>
            <p className="mt-1 font-bold">admin@ems.local</p>
          </div>
          <div className="panel p-4">
            <p className="text-sm font-bold text-[var(--muted)]">HR Manager</p>
            <p className="mt-1 font-bold">hr@ems.local</p>
          </div>
          <div className="panel p-4">
            <p className="text-sm font-bold text-[var(--muted)]">Employee</p>
            <p className="mt-1 font-bold">employee@ems.local</p>
          </div>
          <p className="badge justify-center">Password: Password123!</p>
        </div>
        </div>
      </section>
    </main>
  );
}
