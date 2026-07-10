import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, ShoppingCart, Clock, DollarSign, Package2 } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from "recharts";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: orders = [] } = useQuery({
    queryKey: ["admin_orders_all"],
    queryFn: async () => {
      const { data } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  const { data: productCount = 0 } = useQuery({
    queryKey: ["admin_product_count"],
    queryFn: async () => {
      const { count } = await supabase.from("products").select("*", { count: "exact", head: true });
      return count ?? 0;
    },
  });

  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + Number(o.total), 0);
  const active = orders.filter((o) => ["pending", "confirmed", "sent_to_ecomdrive", "shipped"].includes(o.status)).length;
  const preOrders = orders.filter((o) => o.is_pre_order && o.status !== "cancelled" && o.status !== "delivered").length;
  const confirmed = orders.filter((o) => o.status === "delivered").length;
  const conversion = orders.length ? ((confirmed / orders.length) * 100).toFixed(1) : "0";

  // Sales last 7 days
  const days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const dayOrders = orders.filter((o) => o.created_at.slice(0, 10) === key);
    return {
      day: d.toLocaleDateString("en-GB", { weekday: "short" }),
      revenue: dayOrders.reduce((s, o) => s + Number(o.total), 0),
      orders: dayOrders.length,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">রিয়েল-টাইম অ্যানালিটিক্স ও পারফরম্যান্স</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total Revenue" value={`৳${revenue.toLocaleString()}`} icon={DollarSign} accent />
        <Stat label="Active Orders" value={active.toString()} icon={ShoppingCart} />
        <Stat label="Pending Pre-Orders" value={preOrders.toString()} icon={Clock} />
        <Stat label="Total Products" value={productCount.toString()} icon={Package2} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Revenue — Last 7 Days" subtitle={`Conversion: ${conversion}%`} icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="oklch(0.66 0.215 38)" strokeWidth={3} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card title="Orders — Last 7 Days" icon={ShoppingCart}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={days}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="orders" fill="oklch(0.18 0.01 40)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card title="Recent Orders">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr><th className="py-2">Order</th><th>Customer</th><th>Product</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="py-2 font-mono text-xs">{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td className="max-w-[200px] truncate">{o.product_name}</td>
                  <td className="font-bold">৳{Number(o.total).toLocaleString()}</td>
                  <td><StatusPill status={o.status} /></td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">কোনো অর্ডার নেই</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function Stat({ label, value, icon: Icon, accent }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; accent?: boolean }) {
  return (
    <div className={`rounded-2xl border p-5 shadow-card ${accent ? "bg-gradient-brand text-primary-foreground" : "bg-card"}`}>
      <div className="flex items-center justify-between">
        <p className={`text-xs font-semibold uppercase tracking-wide ${accent ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{label}</p>
        <Icon className={`h-5 w-5 ${accent ? "" : "text-primary"}`} />
      </div>
      <p className="mt-3 text-3xl font-extrabold">{value}</p>
    </div>
  );
}

function Card({ title, subtitle, icon: Icon, children }: { title: string; subtitle?: string; icon?: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="mb-4 flex items-center gap-2">
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <div><h3 className="font-bold">{title}</h3>{subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}</div>
      </div>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    sent_to_ecomdrive: "bg-purple-100 text-purple-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    pre_order: "bg-orange-100 text-orange-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${map[status] ?? "bg-gray-100"}`}>{status.replace(/_/g, " ")}</span>;
}
