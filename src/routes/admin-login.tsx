import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { loginAdmin } from "@/lib/local-store";

export const Route = createFileRoute("/admin-login")({
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onLogin = () => {
    if (loginAdmin(username, password)) {
      navigate({ to: "/admin" });
    } else {
      setError("ভুল ইউজারনেম বা পাসওয়ার্ড");
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-card">
        <h1 className="text-2xl font-extrabold">অ্যাডমিন লগইন</h1>
        <p className="mt-2 text-sm text-muted-foreground">ডিফল্ট: admin / admin123</p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 text-sm font-semibold">ইউজারনেম</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
          </label>
          <label className="block">
            <span className="mb-1 text-sm font-semibold">পাসওয়ার্ড</span>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
          </label>
          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          <button onClick={onLogin} className="flex w-full items-center justify-center rounded-xl bg-gradient-brand px-4 py-3 font-bold text-primary-foreground">লগইন</button>
        </div>
      </div>
    </div>
  );
}
