import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { registerUser, loginUser, getSession } from "@/lib/local-store";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const result = loginUser(email, password);
        if (result.success) {
          toast.success("স্বাগতম!");
          setTimeout(() => {
            window.location.href = "/store";
          }, 500);
        } else {
          toast.error(result.message);
        }
      } else {
        const result = registerUser(email, password);
        if (result.success) {
          toast.success(result.message);
          setEmail("");
          setPassword("");
          setMode("signin");
        } else {
          toast.error(result.message);
        }
      }
    } catch (e) {
      toast.error((e as Error).message || "কোনো সমস্যা হয়েছে");
    } finally {
      setLoading(false);
    }
  }

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-background"><p className="text-lg font-semibold">লোড হচ্ছে...</p></div>;
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
            {mode === "signin" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
          </button>
        </form>
        <button onClick={() => setMode((m) => (m === "signin" ? "signup" : "signin"))}
          className="mt-4 w-full text-center text-sm text-muted-foreground hover:text-primary">
          {mode === "signin" ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
        </button>
        <div className="mt-6 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
          <p className="mb-1 flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> <strong>ডেমো অ্যাকাউন্ট:</strong></p>
          <p>ইমেইল: demo@test.com</p>
          <p>পাসওয়ার্ড: demo123</p>
        </div>
      </div>
    </div>
  );
}
