import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { LayoutDashboard, ShoppingCart, Package, Settings, LogOut, ShieldAlert } from "lucide-react";
import logo from "@/assets/logo.png";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Nijer Bazaar" }] }),
  component: AdminLayout,
});

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/orders", label: "Orders", icon: ShoppingCart, exact: false },
  { to: "/admin/products", label: "Products", icon: Package, exact: false },
  { to: "/admin/settings", label: "Settings", icon: Settings, exact: false },
] as const;

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ["is_admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", u.user.id).eq("role", "admin").maybeSingle();
      return !!data;
    },
  });

  async function signOut() {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  }

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-background">লোড হচ্ছে...</div>;

  if (!isAdmin) {
    return (
      <div className="grid min-h-screen place-items-center bg-background px-4">
        <div className="max-w-md rounded-2xl border bg-card p-8 text-center shadow-card">
          <ShieldAlert className="mx-auto h-12 w-12 text-destructive" />
          <h1 className="mt-4 text-2xl font-bold">প্রবেশ নিষেধ</h1>
          <p className="mt-2 text-sm text-muted-foreground">এই অ্যাকাউন্টে অ্যাডমিন অনুমতি নেই।</p>
          <button onClick={signOut} className="mt-5 rounded-full bg-gradient-brand px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-brand">লগআউট</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-muted/40">
      <aside className="hidden w-64 flex-col bg-sidebar text-sidebar-foreground md:flex">
        <div className="p-5">
          <Link to="/"><img src={logo} alt="" className="h-12 w-auto rounded-md bg-white/10 p-1" /></Link>
          <p className="mt-3 text-xs uppercase tracking-wider text-sidebar-foreground/60">Admin Panel</p>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {nav.map((n) => {
            const active = n.exact ? pathname === n.to : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-brand" : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                }`}>
                <n.icon className="h-4 w-4" /> {n.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={signOut} className="m-3 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-sidebar-foreground/80 hover:bg-sidebar-accent">
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </aside>
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b bg-background px-4 py-3 md:hidden">
          <img src={logo} alt="" className="h-8 w-auto" />
          <button onClick={signOut} className="text-sm font-semibold text-primary">Logout</button>
        </header>
        <nav className="flex gap-1 overflow-x-auto border-b bg-background p-2 md:hidden">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="rounded-md px-3 py-1.5 text-xs font-semibold text-foreground/70 hover:bg-muted">
              {n.label}
            </Link>
          ))}
        </nav>
        <main className="flex-1 p-4 sm:p-6 lg:p-8"><Outlet /></main>
      </div>
    </div>
  );
}
