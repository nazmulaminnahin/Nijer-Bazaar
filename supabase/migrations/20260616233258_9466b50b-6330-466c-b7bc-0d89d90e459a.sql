
ALTER FUNCTION public.set_updated_at() SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

-- Tighten insert policies so they aren't permissive (always-true)
DROP POLICY IF EXISTS "Anyone can place an order" ON public.orders;
DROP POLICY IF EXISTS "Auth can place an order" ON public.orders;

CREATE POLICY "Anyone places valid order" ON public.orders FOR INSERT TO anon
  WITH CHECK (
    char_length(customer_name) BETWEEN 2 AND 120
    AND char_length(phone) BETWEEN 6 AND 30
    AND char_length(address) BETWEEN 5 AND 500
    AND total >= 0
    AND quantity > 0
  );

CREATE POLICY "Auth places valid order" ON public.orders FOR INSERT TO authenticated
  WITH CHECK (
    char_length(customer_name) BETWEEN 2 AND 120
    AND char_length(phone) BETWEEN 6 AND 30
    AND char_length(address) BETWEEN 5 AND 500
    AND total >= 0
    AND quantity > 0
  );
