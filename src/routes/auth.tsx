import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { login, signup, getSession } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn()) return;
    getSession()
      .then(() => navigate({ to: "/admin" }))
      .catch(() => {});
  }, [navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        await login(email, password);
        toast.success("স্বাগতম!");
        navigate({ to: "/admin" });
      } else {
        await signup(email, password);
        toast.success("অ্যাকাউন্ট তৈরি হয়েছে — লগইন করুন");
        setMode("signin");
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-hero p-4">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-2xl">
        <Link to="/" className="mx-auto block w-fit"><img src={logo} alt="Nijer Bazaar" className="h-14 w-auto rounded-md" /></Link>
        <div className="mt-6 text-center">
          <h1 className="text-2xl font-extrabold text-foreground">অ্যাডমিন প্যানেল</h1>
          <p className="mt-1 text-sm text-muted-foreground">{mode === "signin" ? "আপনার অ্যাকাউন্টে লগইন করুন" : "নতুন অ্যাকাউন্ট তৈরি করুন"}</p>
        </div>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-semibold">ইমেইল</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </div>
          <div>
            <label className="text-sm font-semibold">পাসওয়ার্ড</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-input bg-background px-4 py-3 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30" />
          </div>
          <button type="submit" disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-5 py-3 text-base font-bold text-primary-foreground shadow-brand disabled:opacity-60">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "signin" ? "লগইন" : "সাইন আপ"}
          </button>
        </form>
        <button onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "signin" ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
        </button>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-success" /> Secure admin access
        </p>
      </div>
    </div>
  );
}
