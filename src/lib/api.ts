import { clearAccessToken, getAccessToken, setAccessToken } from "./auth";
import type { Tables, TablesInsert } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

type Product = Tables<"products">;
type Order = Tables<"orders">;
type Review = Tables<"reviews">;
type Setting = Tables<"settings">;
type OrderStatus = Tables<"orders">["status"];

async function request<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (auth) {
    const token = getAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// Public
export async function getProducts(): Promise<Product[]> {
  return request("/api/products");
}

export async function getProductBySlug(slug: string): Promise<{ product: Product; reviews: Review[] }> {
  return request(`/api/products/${slug}`);
}

export async function createOrder(order: TablesInsert<"orders">): Promise<{ order_number: string }> {
  return request("/api/orders", { method: "POST", body: JSON.stringify(order) });
}

export async function getFacebookPixelId(): Promise<string> {
  const data = await request<{ id: string }>("/api/settings/facebook-pixel");
  return data.id;
}

// Auth
export async function login(email: string, password: string) {
  const data = await request<{ access_token: string; user: { id: string; email?: string } }>(
    "/api/auth/login",
    { method: "POST", body: JSON.stringify({ email, password }) },
  );
  setAccessToken(data.access_token);
  return data;
}

export async function signup(email: string, password: string) {
  return request("/api/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function logout() {
  try {
    await request("/api/auth/logout", { method: "POST" }, true);
  } finally {
    clearAccessToken();
  }
}

export async function getSession() {
  return request<{ user: { id: string; email?: string } }>("/api/auth/session", {}, true);
}

export async function getAdminMe() {
  return request<{ isAdmin: boolean; userId: string }>("/api/auth/me", {}, true);
}

// Admin
export async function getAdminProducts(): Promise<Product[]> {
  return request("/api/admin/products", {}, true);
}

export async function saveAdminProduct(product: Partial<Product>) {
  if (product.id) {
    return request(`/api/admin/products/${product.id}`, {
      method: "PUT",
      body: JSON.stringify(product),
    }, true);
  }
  return request("/api/admin/products", {
    method: "POST",
    body: JSON.stringify(product),
  }, true);
}

export async function deleteAdminProduct(id: string) {
  return request(`/api/admin/products/${id}`, { method: "DELETE" }, true);
}

export async function getAdminOrders(status?: OrderStatus | "all"): Promise<Order[]> {
  const query = status && status !== "all" ? `?status=${status}` : "";
  return request(`/api/admin/orders${query}`, {}, true);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return request(`/api/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  }, true);
}

export async function dispatchOrder(id: string) {
  return request<{ trackingId?: string; provider: string; message: string }>(
    `/api/admin/orders/${id}/dispatch`,
    { method: "POST" },
    true,
  );
}

export async function getAdminSettings(): Promise<Setting[]> {
  return request("/api/admin/settings", {}, true);
}

export async function saveAdminSetting(key: string, value: Record<string, string>) {
  return request(`/api/admin/settings/${key}`, {
    method: "PUT",
    body: JSON.stringify({ value }),
  }, true);
}

export async function getAdminStats(): Promise<{ orders: Order[]; productCount: number }> {
  return request("/api/admin/stats", {}, true);
}
