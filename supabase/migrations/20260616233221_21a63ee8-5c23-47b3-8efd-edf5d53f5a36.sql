
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Auto-assign admin on signup for the seeded email; everyone else gets 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF lower(NEW.email) = 'simumhossain342@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Products
CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  price numeric(10,2) NOT NULL,
  compare_at_price numeric(10,2),
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  video_url text,
  stock integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  is_flash_sale boolean NOT NULL DEFAULT false,
  flash_sale_ends_at timestamptz,
  is_pre_order boolean NOT NULL DEFAULT false,
  pre_order_eta_days text DEFAULT '15-20',
  partial_advance numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active products" ON public.products FOR SELECT TO anon USING (is_active = true);
CREATE POLICY "Auth can read active products" ON public.products FOR SELECT TO authenticated USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage products" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER products_set_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Orders
CREATE TYPE public.order_status AS ENUM ('pending','confirmed','sent_to_ecomdrive','shipped','delivered','pre_order','cancelled');
CREATE TYPE public.payment_method AS ENUM ('cod','bkash','nagad','sslcommerz');

CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text NOT NULL UNIQUE DEFAULT ('NB-' || to_char(now(),'YYMMDD') || '-' || lpad((floor(random()*99999))::text,5,'0')),
  customer_name text NOT NULL,
  phone text NOT NULL,
  address text NOT NULL,
  delivery_zone text NOT NULL,
  shipping_fee numeric(10,2) NOT NULL,
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  product_name text NOT NULL,
  product_price numeric(10,2) NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  subtotal numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  payment_method public.payment_method NOT NULL DEFAULT 'cod',
  status public.order_status NOT NULL DEFAULT 'pending',
  is_pre_order boolean NOT NULL DEFAULT false,
  notes text,
  courier_tracking text,
  courier_provider text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.orders TO anon;
GRANT INSERT, SELECT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place an order" ON public.orders FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Auth can place an order" ON public.orders FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins view all orders" ON public.orders FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update orders" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER orders_set_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Settings
CREATE TABLE public.settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.settings TO authenticated;
GRANT ALL ON public.settings TO service_role;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only public-safe key (facebook_pixel_id) readable by anon
CREATE POLICY "Public pixel id" ON public.settings FOR SELECT TO anon USING (key = 'facebook_pixel_id');
CREATE POLICY "Public pixel id auth" ON public.settings FOR SELECT TO authenticated USING (key = 'facebook_pixel_id' OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage settings" ON public.settings FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER settings_set_updated BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Reviews
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment text NOT NULL,
  image_url text,
  is_approved boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.reviews TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read approved reviews" ON public.reviews FOR SELECT TO anon USING (is_approved = true);
CREATE POLICY "Auth read approved reviews" ON public.reviews FOR SELECT TO authenticated USING (is_approved = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage reviews" ON public.reviews FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Seed default settings rows (empty placeholders)
INSERT INTO public.settings (key, value) VALUES
  ('facebook_pixel_id', '{"id": ""}'),
  ('facebook_capi', '{"access_token": "", "test_event_code": ""}'),
  ('ecomdrive', '{"api_key": "", "base_url": "https://ecomdrivebd.com/api"}'),
  ('steadfast', '{"api_key": "", "secret_key": "", "base_url": "https://portal.packzy.com/api/v1"}'),
  ('pathao', '{"client_id": "", "client_secret": "", "username": "", "password": "", "base_url": "https://api-hermes.pathao.com"}'),
  ('payment_bkash', '{"merchant_number": "", "app_key": "", "app_secret": ""}'),
  ('payment_nagad', '{"merchant_number": "", "merchant_id": ""}'),
  ('payment_sslcommerz', '{"store_id": "", "store_password": ""}')
ON CONFLICT (key) DO NOTHING;
