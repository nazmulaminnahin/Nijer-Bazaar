export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  features: string[];
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  is_flash_sale: boolean;
  flash_sale_ends_at: string | null;
  is_pre_order: boolean;
  pre_order_eta_days: string;
  partial_advance: number | null;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone: string;
  address: string;
  delivery_zone: string;
  shipping_fee: number;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
  total: number;
  payment_method: string;
  status: string;
  is_pre_order: boolean;
  created_at: string;
}

export interface SiteSettings {
  quickLinks: Array<{ label: string; href: string }>;
  policies: Array<{ title: string; content: string }>;
  contact: {
    phone: string;
    email: string;
    address: string;
    facebook: string;
  };
}

const STORAGE_KEYS = {
  products: "nijer-bazaar-products",
  orders: "nijer-bazaar-orders",
  settings: "nijer-bazaar-settings",
  adminAuth: "nijer-bazaar-admin-auth",
  users: "nijer-bazaar-users",
  userSession: "nijer-bazaar-user-session",
};

function getStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function readJson<T>(key: string, fallback: T): T {
  const storage = getStorage();
  if (!storage) return fallback;
  try {
    const raw = storage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  const storage = getStorage();
  if (!storage) return;
  storage.setItem(key, JSON.stringify(value));
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultProducts(): Product[] {
  return [
    {
      id: createId(),
      slug: "ai-over-charging-protector",
      name: "AI Over Charging Protector",
      tagline: "স্মার্ট ডিভাইস, নিরাপদ চার্জিং",
      description: "এই পণ্য আপনার ডিভাইসকে অতিরিক্ত চার্জিং থেকে নিরাপদ রাখে।",
      price: 850,
      compare_at_price: 1200,
      images: [
        "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
      ],
      features: ["অতিরিক্ত চার্জিং রোধ করে", "দ্রুত এবং নিরাপদ", "প্রতি ব্যবহারেই স্থিতিশীল"],
      stock: 25,
      is_active: true,
      is_featured: true,
      is_flash_sale: false,
      flash_sale_ends_at: null,
      is_pre_order: false,
      pre_order_eta_days: "7-10",
      partial_advance: null,
      created_at: new Date().toISOString(),
    },
    {
      id: createId(),
      slug: "wireless-organizer-kit",
      name: "Wireless Organizer Kit",
      tagline: "কেবল ও ডিভাইস একসাথে সুন্দরভাবে",
      description: "আপনার ঘর বা অফিসের কেবলগুলো সুন্দর ও সংগঠিত রাখার জন্য আদর্শ।",
      price: 1250,
      compare_at_price: 1500,
      images: [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
      ],
      features: ["কমপ্যাক্ট ডিজাইন", "দ্রুত সেটআপ", "বেশি ব্যবহার উপযোগী"],
      stock: 15,
      is_active: true,
      is_featured: false,
      is_flash_sale: true,
      flash_sale_ends_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
      is_pre_order: false,
      pre_order_eta_days: "5-7",
      partial_advance: null,
      created_at: new Date().toISOString(),
    },
  ];
}

function createDefaultSettings(): SiteSettings {
  return {
    quickLinks: [
      { label: "হোম", href: "/" },
      { label: "সকল পণ্য", href: "/store" },
      { label: "কেন আমরা", href: "/#trust" },
    ],
    policies: [
      { title: "রিফান্ড পলিসি", content: "যদি পণ্য পৌঁছানোর আগে কোনো সমস্যা হয়, আমরা রিফান্ড দিতে পারি।" },
      { title: "রিটার্ন পলিসি", content: "পণ্য পৌঁছানোর ৩ দিনের মধ্যে রিটার্নের আবেদন করা যাবে।" },
      { title: "প্রাইভেসি পলিসি", content: "আপনার তথ্য শুধুমাত্র অর্ডার প্রসেসিং-এর জন্য ব্যবহার করা হবে।" },
    ],
    contact: {
      phone: "09XXX-XXXXXX",
      email: "support@nijerbazaarbd.com",
      address: "Dhaka, Bangladesh",
      facebook: "/nijerbazaar",
    },
  };
}

export function seedLocalData() {
  const storage = getStorage();
  if (!storage) return;
  if (!storage.getItem(STORAGE_KEYS.products)) {
    writeJson(STORAGE_KEYS.products, createDefaultProducts());
  }
  if (!storage.getItem(STORAGE_KEYS.settings)) {
    writeJson(STORAGE_KEYS.settings, createDefaultSettings());
  }
  if (!storage.getItem(STORAGE_KEYS.orders)) {
    writeJson(STORAGE_KEYS.orders, []);
  }
  if (!storage.getItem(STORAGE_KEYS.adminAuth)) {
    writeJson(STORAGE_KEYS.adminAuth, { username: "admin", password: "admin123" });
  }
  if (!storage.getItem(STORAGE_KEYS.users)) {
    writeJson(STORAGE_KEYS.users, [
      {
        id: "user-demo-001",
        email: "demo@test.com",
        password: "demo123",
        created_at: new Date().toISOString(),
      },
    ]);
  }
}

export function getProducts(): Product[] {
  seedLocalData();
  return readJson<Product[]>(STORAGE_KEYS.products, []);
}

export function getVisibleProducts(): Product[] {
  return getProducts().filter((product) => product.is_active);
}

export function getProductBySlug(slug: string): Product | null {
  return getProducts().find((product) => product.slug === slug && product.is_active) ?? null;
}

export function saveProduct(product: Product) {
  const products = getProducts();
  const normalized = {
    ...product,
    id: product.id || createId(),
    created_at: product.created_at || new Date().toISOString(),
  };
  const idx = products.findIndex((item) => item.id === normalized.id);
  if (idx >= 0) {
    products[idx] = normalized;
  } else {
    products.unshift(normalized);
  }
  writeJson(STORAGE_KEYS.products, products);
  return normalized;
}

export function deleteProduct(id: string) {
  const products = getProducts().filter((item) => item.id !== id);
  writeJson(STORAGE_KEYS.products, products);
}

export function toggleProductVisibility(id: string) {
  const products = getProducts().map((product) => (product.id === id ? { ...product, is_active: !product.is_active } : product));
  writeJson(STORAGE_KEYS.products, products);
}

export function createOrder(order: Omit<Order, "id" | "order_number" | "created_at">): { order_number: string } {
  const orders = readJson<Order[]>(STORAGE_KEYS.orders, []);
  const orderNumber = `NB-${String(Date.now()).slice(-6)}`;
  const newOrder: Order = {
    ...order,
    id: createId(),
    order_number: orderNumber,
    created_at: new Date().toISOString(),
  };
  orders.unshift(newOrder);
  writeJson(STORAGE_KEYS.orders, orders);
  return { order_number: orderNumber };
}

export function getOrders(): Order[] {
  return readJson<Order[]>(STORAGE_KEYS.orders, []);
}

export function getSiteSettings(): SiteSettings {
  seedLocalData();
  return readJson<SiteSettings>(STORAGE_KEYS.settings, createDefaultSettings());
}

export function saveSiteSettings(settings: SiteSettings) {
  writeJson(STORAGE_KEYS.settings, settings);
}

export function loginAdmin(username: string, password: string) {
  const auth = readJson<{ username: string; password: string }>(STORAGE_KEYS.adminAuth, { username: "admin", password: "admin123" });
  const ok = username === auth.username && password === auth.password;
  if (ok && typeof window !== "undefined") {
    window.localStorage.setItem("nijer-bazaar-admin-auth-token", "true");
  }
  return ok;
}

export function isAdminAuthenticated() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("nijer-bazaar-admin-auth-token") === "true";
}

export function logoutAdmin() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("nijer-bazaar-admin-auth-token");
  }
}

// User Authentication (for /auth page)
interface User {
  id: string;
  email: string;
  password: string;
  created_at: string;
}

export function registerUser(email: string, password: string): { success: boolean; message: string } {
  if (!email || !password) {
    return { success: false, message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" };
  }

  const users = readJson<User[]>(STORAGE_KEYS.users, []);

  // Check if user already exists
  if (users.some((u) => u.email === email)) {
    return { success: false, message: "এই ইমেইলে ইতিমধ্যে অ্যাকাউন্ট আছে" };
  }

  // Create new user
  const newUser: User = {
    id: createId(),
    email,
    password, // In production, hash this!
    created_at: new Date().toISOString(),
  };

  users.push(newUser);
  writeJson(STORAGE_KEYS.users, users);

  return { success: true, message: "অ্যাকাউন্ট তৈরি হয়েছে" };
}

export function loginUser(email: string, password: string): { success: boolean; message: string } {
  if (!email || !password) {
    return { success: false, message: "ইমেইল এবং পাসওয়ার্ড প্রয়োজন" };
  }

  seedLocalData(); // Ensure demo account exists
  const users = readJson<User[]>(STORAGE_KEYS.users, []);
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return { success: false, message: "ভুল ইমেইল বা পাসওয়ার্ড" };
  }

  // Set user session
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEYS.userSession, JSON.stringify({ id: user.id, email: user.email }));
  }

  return { success: true, message: "সফলভাবে লগইন হয়েছেন" };
}

export function getSession(): { id: string; email: string } | null {
  if (typeof window === "undefined") return null;
  const session = window.localStorage.getItem(STORAGE_KEYS.userSession);
  return session ? JSON.parse(session) : null;
}

export function logoutUser() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEYS.userSession);
  }
}

export function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!window.localStorage.getItem(STORAGE_KEYS.userSession);
}
