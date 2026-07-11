import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getSiteSettings, isAdminAuthenticated, loginAdmin, logoutAdmin, saveSiteSettings, getProducts, saveProduct, deleteProduct, toggleProductVisibility, type Product, type SiteSettings } from "@/lib/local-store";
import { ShieldCheck, Plus, Trash2, Eye, EyeOff, LogOut, Flame } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  useEffect(() => {
    try {
      setAuthenticated(isAdminAuthenticated());
      if (isAdminAuthenticated()) {
        setProducts(getProducts());
        setSettings(getSiteSettings());
      }
      setReady(true);
    } catch (error) {
      console.error("Failed to load admin data:", error);
      setReady(true);
    }
  }, []);

  const onLogin = () => {
    try {
      if (loginAdmin(username, password)) {
        setAuthenticated(true);
        setProducts(getProducts());
        setSettings(getSiteSettings());
        setAuthError("");
        toast.success("সফলভাবে লগইন হয়েছেন");
      } else {
        setAuthError("ভুল ইউজারনেম বা পাসওয়ার্ড");
      }
    } catch (error) {
      setAuthError("লগইন ব্যর্থ হয়েছে");
      console.error("Login error:", error);
    }
  };

  const onLogout = () => {
    logoutAdmin();
    setAuthenticated(false);
    setUsername("");
    setPassword("");
  };

  const onSaveProduct = () => {
    if (!editingProduct) return;
    try {
      const productToSave: Product = {
        ...editingProduct,
        id: editingProduct.id || `prod-${Date.now()}`,
        slug: editingProduct.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
        price: Number(editingProduct.price || 0),
        compare_at_price: editingProduct.compare_at_price ? Number(editingProduct.compare_at_price) : null,
        partial_advance: editingProduct.partial_advance ? Number(editingProduct.partial_advance) : null,
        stock: Number(editingProduct.stock || 0),
        images: Array.isArray(editingProduct.images) ? editingProduct.images.filter(Boolean) : [],
        features: Array.isArray(editingProduct.features) ? editingProduct.features.filter(Boolean) : [],
        created_at: editingProduct.created_at || new Date().toISOString(),
      };
      saveProduct(productToSave);
      setProducts(getProducts());
      setEditingProduct(null);
      toast.success("পণ্য সংরক্ষিত হয়েছে");
    } catch (error) {
      toast.error("পণ্য সংরক্ষণ ব্যর্থ");
      console.error("Save error:", error);
    }
  };

  const onDeleteProduct = (id: string) => {
    if (confirm("এটি মুছতে চান?")) {
      deleteProduct(id);
      setProducts(getProducts());
      toast.success("পণ্য মুছে ফেলা হয়েছে");
    }
  };

  const onToggleVisibility = (id: string) => {
    toggleProductVisibility(id);
    setProducts(getProducts());
  };

  const onSaveSettings = () => {
    if (!settings) return;
    try {
      saveSiteSettings(settings);
      toast.success("সেটিংস সংরক্ষিত হয়েছে");
    } catch (error) {
      toast.error("সেটিংস সংরক্ষণ ব্যর্থ");
      console.error("Settings save error:", error);
    }
  };

  if (!ready) {
    return <div className="grid min-h-screen place-items-center bg-background"><p className="text-lg font-semibold">লোড হচ্ছে...</p></div>;
  }

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-md rounded-2xl border bg-card p-8 shadow-card">
          <div className="mb-6 flex items-center gap-3 rounded-lg bg-primary/10 p-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-extrabold">অ্যাডমিন লগইন</h1>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">স্টোর পরিচালনার জন্য লগইন করুন</p>
          <p className="mb-4 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <span className="font-semibold">ডিফল্ট:</span> admin / admin123
          </p>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">ইউজারনেম</span>
              <input value={username} onChange={(e) => setUsername(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onLogin()} className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">পাসওয়ার্ড</span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onLogin()} className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary" />
            </label>
            {authError && <p className="rounded-lg bg-destructive/10 p-2 text-sm text-destructive">{authError}</p>}
            <button onClick={onLogin} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-brand px-4 py-3 font-bold text-primary-foreground shadow-brand">
              লগইন করুন
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-5 shadow-card">
          <div>
            <h1 className="text-2xl font-extrabold">অ্যাডমিন প্যানেল</h1>
            <p className="text-sm text-muted-foreground">পণ্য, অফার ও ফুটার পরিচালনা করুন</p>
          </div>
          <div className="flex gap-2">
            <Link to="/" className="rounded-full border px-4 py-2 text-sm font-semibold">সাইটে ফিরুন</Link>
            <button onClick={onLogout} className="flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
              <LogOut className="h-4 w-4" /> লগআউট
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-extrabold">পণ্য ব্যবস্থাপনা</h2>
                <p className="text-sm text-muted-foreground">পণ্য যোগ, দেখান/লুকান, মুছুন</p>
              </div>
              <button onClick={() => setEditingProduct({ id: "", slug: "", name: "", tagline: "", description: "", price: 0, compare_at_price: null, images: [], features: [], stock: 100, is_active: true, is_featured: false, is_flash_sale: false, flash_sale_ends_at: null, is_pre_order: false, pre_order_eta_days: "7-10", partial_advance: null, created_at: new Date().toISOString() })} className="flex items-center gap-2 rounded-full bg-gradient-brand px-4 py-2 text-sm font-bold text-primary-foreground shadow-brand">
                <Plus className="h-4 w-4" /> নতুন পণ্য
              </button>
            </div>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {products.map((product) => (
                <div key={product.id} className="rounded-xl border p-4 hover:bg-muted/50">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold">{product.name || "নতুন পণ্য"}</h3>
                        {product.is_flash_sale && <Flame className="h-4 w-4 text-destructive" />}
                      </div>
                      <p className="text-sm text-muted-foreground">/{product.slug || "slug"}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      <button onClick={() => onToggleVisibility(product.id)} className="rounded-full border px-3 py-1.5 text-sm font-semibold hover:bg-muted" title={product.is_active ? "লুকান" : "দেখান"}>
                        {product.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </button>
                      <button onClick={() => setEditingProduct(product)} className="rounded-full border px-3 py-1.5 text-sm font-semibold hover:bg-muted">সম্পাদনা</button>
                      <button onClick={() => onDeleteProduct(product.id)} className="rounded-full border px-3 py-1.5 text-sm font-semibold text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-sm">
                    <span className="text-primary font-semibold">৳{Number(product.price).toLocaleString()}</span>
                    <span className="text-muted-foreground">স্টক: {product.stock}</span>
                    {product.is_flash_sale && product.flash_sale_ends_at && <span className="text-xs bg-destructive/10 text-destructive px-2 py-1 rounded">সময়মত অফার</span>}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="mb-4">
              <h2 className="text-xl font-extrabold">ফুটার কনটেন্ট</h2>
              <p className="text-sm text-muted-foreground">Quick links, policies, contact তথ্য পরিবর্তন করুন</p>
            </div>
            {settings ? (
            <div className="space-y-4">
              <div>
                <h3 className="mb-2 font-semibold">Quick Links</h3>
                {settings.quickLinks.map((link, idx) => (
                  <div key={idx} className="mb-2 grid gap-2 sm:grid-cols-[1fr,1fr]">
                    <input value={link.label} onChange={(e) => { const next = [...settings.quickLinks]; next[idx] = { ...next[idx], label: e.target.value }; setSettings({ ...settings, quickLinks: next }); }} className="rounded-lg border border-input bg-background px-3 py-2" />
                    <input value={link.href} onChange={(e) => { const next = [...settings.quickLinks]; next[idx] = { ...next[idx], href: e.target.value }; setSettings({ ...settings, quickLinks: next }); }} className="rounded-lg border border-input bg-background px-3 py-2" />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Policies</h3>
                {settings.policies.map((policy, idx) => (
                  <div key={idx} className="mb-2 space-y-2">
                    <input value={policy.title} onChange={(e) => { const next = [...settings.policies]; next[idx] = { ...next[idx], title: e.target.value }; setSettings({ ...settings, policies: next }); }} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                    <textarea value={policy.content} onChange={(e) => { const next = [...settings.policies]; next[idx] = { ...next[idx], content: e.target.value }; setSettings({ ...settings, policies: next }); }} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                  </div>
                ))}
              </div>
              <div>
                <h3 className="mb-2 font-semibold">Contact</h3>
                <div className="space-y-2">
                  <input value={settings.contact.phone} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, phone: e.target.value } })} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                  <input value={settings.contact.email} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, email: e.target.value } })} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                  <input value={settings.contact.address} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, address: e.target.value } })} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                  <input value={settings.contact.facebook} onChange={(e) => setSettings({ ...settings, contact: { ...settings.contact, facebook: e.target.value } })} className="w-full rounded-lg border border-input bg-background px-3 py-2" />
                </div>
              </div>
              <button onClick={onSaveSettings} className="w-full rounded-xl bg-gradient-brand px-4 py-3 font-bold text-primary-foreground">সেভ করুন</button>
            </div>
            ) : null}
          </section>
        </div>

        {editingProduct ? (
          <div className="rounded-2xl border bg-card p-5 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-extrabold">{editingProduct.id ? "পণ্য সম্পাদনা" : "নতুন পণ্য"}</h3>
              <button onClick={() => setEditingProduct(null)} className="rounded-full border px-3 py-1.5 text-sm">বন্ধ</button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block"><span className="mb-1 text-sm font-semibold">নাম</span><input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block"><span className="mb-1 text-sm font-semibold">Slug</span><input value={editingProduct.slug} onChange={(e) => setEditingProduct({ ...editingProduct, slug: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block"><span className="mb-1 text-sm font-semibold">Tagline</span><input value={editingProduct.tagline} onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block"><span className="mb-1 text-sm font-semibold">দাম</span><input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block"><span className="mb-1 text-sm font-semibold">Compare Price</span><input type="number" value={editingProduct.compare_at_price ?? ""} onChange={(e) => setEditingProduct({ ...editingProduct, compare_at_price: e.target.value ? Number(e.target.value) : null })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block"><span className="mb-1 text-sm font-semibold">স্টক</span><input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block md:col-span-2"><span className="mb-1 text-sm font-semibold">বর্ণনা</span><textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block md:col-span-2"><span className="mb-1 text-sm font-semibold">ফিচার (প্রতি লাইনে একটি)</span><textarea value={editingProduct.features.join("\n")} onChange={(e) => setEditingProduct({ ...editingProduct, features: e.target.value.split("\n").filter(Boolean) })} rows={4} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="block md:col-span-2"><span className="mb-1 text-sm font-semibold">ছবি URLs (প্রতি লাইনে একটি)</span><textarea value={editingProduct.images.join("\n")} onChange={(e) => setEditingProduct({ ...editingProduct, images: e.target.value.split("\n").filter(Boolean) })} rows={3} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              <label className="flex items-center gap-2 rounded-lg border p-3"><input type="checkbox" checked={editingProduct.is_active} onChange={(e) => setEditingProduct({ ...editingProduct, is_active: e.target.checked })} /><span>দৃশ্যমান</span></label>
              <label className="flex items-center gap-2 rounded-lg border p-3"><input type="checkbox" checked={editingProduct.is_featured} onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })} /><span>Featured</span></label>
              <label className="flex items-center gap-2 rounded-lg border p-3"><input type="checkbox" checked={editingProduct.is_flash_sale} onChange={(e) => setEditingProduct({ ...editingProduct, is_flash_sale: e.target.checked })} /><span className="flex items-center gap-2"><Flame className="h-4 w-4" /> Flash Sale</span></label>
              {editingProduct.is_flash_sale && (
                <label className="block md:col-span-1"><span className="mb-1 text-sm font-semibold">অফার শেষ হবে (সময়)</span><input type="datetime-local" value={editingProduct.flash_sale_ends_at ? editingProduct.flash_sale_ends_at.slice(0, 16) : ""} onChange={(e) => setEditingProduct({ ...editingProduct, flash_sale_ends_at: e.target.value ? new Date(e.target.value).toISOString() : null })} className="w-full rounded-lg border border-input bg-background px-3 py-2" /></label>
              )}
              <label className="flex items-center gap-2 rounded-lg border p-3"><input type="checkbox" checked={editingProduct.is_pre_order} onChange={(e) => setEditingProduct({ ...editingProduct, is_pre_order: e.target.checked })} /><span>Pre-Order</span></label>
            </div>
            <button onClick={onSaveProduct} className="mt-5 w-full rounded-xl bg-gradient-brand px-4 py-3 font-bold text-primary-foreground">সেভ করুন</button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

