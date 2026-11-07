CREATE TABLE public.profiles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name text NOT NULL DEFAULT '',
  owner_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  doc_type text NOT NULL DEFAULT 'DNI',
  doc_number text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_business_name_length CHECK (char_length(business_name) <= 200),
  CONSTRAINT profiles_owner_name_length CHECK (char_length(owner_name) <= 200),
  CONSTRAINT profiles_phone_valid CHECK (phone = '' OR phone ~ '^9[0-9]{8}$'),
  CONSTRAINT profiles_doc_type_valid CHECK (doc_type IN ('DNI', 'RUC', 'CE')),
  CONSTRAINT profiles_doc_number_length CHECK (char_length(doc_number) <= 20)
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers read own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "customers create own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "customers update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage profiles" ON public.profiles FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TABLE public.addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  zone text NOT NULL,
  line text NOT NULL,
  ref text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT addresses_zone_length CHECK (char_length(zone) BETWEEN 1 AND 100),
  CONSTRAINT addresses_line_length CHECK (char_length(line) BETWEEN 1 AND 500),
  CONSTRAINT addresses_ref_length CHECK (char_length(ref) <= 500)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers manage own addresses" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage addresses" ON public.addresses FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX addresses_user_id_idx ON public.addresses(user_id);

CREATE TABLE public.taxis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  driver text NOT NULL,
  plate text NOT NULL,
  phone text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT taxis_driver_length CHECK (char_length(driver) BETWEEN 1 AND 200),
  CONSTRAINT taxis_plate_length CHECK (char_length(plate) BETWEEN 1 AND 20),
  CONSTRAINT taxis_phone_valid CHECK (phone = '' OR phone ~ '^9[0-9]{8}$')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.taxis TO authenticated;
GRANT ALL ON public.taxis TO service_role;
ALTER TABLE public.taxis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "customers manage own taxis" ON public.taxis FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "admins manage taxis" ON public.taxis FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE INDEX taxis_user_id_idx ON public.taxis(user_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, business_name, owner_name, phone, doc_type, doc_number)
  VALUES (
    new.id,
    left(coalesce(new.raw_user_meta_data ->> 'business_name', ''), 200),
    left(coalesce(new.raw_user_meta_data ->> 'owner_name', ''), 200),
    coalesce(nullif(new.raw_user_meta_data ->> 'phone', ''), case when new.email ~ '^9[0-9]{8}@clientes\.mercantista\.pe$' then split_part(new.email, '@', 1) else '' end),
    coalesce(nullif(new.raw_user_meta_data ->> 'doc_type', ''), 'DNI'),
    left(coalesce(new.raw_user_meta_data ->> 'doc_number', ''), 20)
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

ALTER TABLE public.orders ADD COLUMN user_id uuid REFERENCES public.profiles(user_id) ON DELETE SET NULL;
CREATE INDEX orders_user_id_created_at_idx ON public.orders(user_id, created_at DESC);
ALTER TABLE public.requests ADD COLUMN user_id uuid DEFAULT auth.uid() REFERENCES public.profiles(user_id) ON DELETE SET NULL;
CREATE INDEX requests_user_id_created_at_idx ON public.requests(user_id, created_at DESC);

CREATE POLICY "customers read own orders" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "customers update own received orders" ON public.orders FOR UPDATE TO authenticated USING (user_id = auth.uid() AND status = 'received') WITH CHECK (user_id = auth.uid() AND status = 'received');

CREATE OR REPLACE FUNCTION public.guard_customer_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL OR public.has_role(auth.uid(), 'admin') THEN
    RETURN new;
  END IF;
  IF new.user_id IS DISTINCT FROM old.user_id OR new.user_id <> auth.uid() THEN
    RAISE EXCEPTION 'No puedes cambiar el propietario del pedido';
  END IF;
  IF new.id IS DISTINCT FROM old.id OR new.code IS DISTINCT FROM old.code OR new.created_at IS DISTINCT FROM old.created_at
    OR new.status IS DISTINCT FROM old.status OR new.items IS DISTINCT FROM old.items
    OR new.subtotal IS DISTINCT FROM old.subtotal OR new.service_fee IS DISTINCT FROM old.service_fee
    OR new.shipping_fee IS DISTINCT FROM old.shipping_fee OR new.total IS DISTINCT FROM old.total
    OR new.weight_kg IS DISTINCT FROM old.weight_kg OR new.packages IS DISTINCT FROM old.packages
    OR new.payment_plan IS DISTINCT FROM old.payment_plan OR new.payment_method IS DISTINCT FROM old.payment_method
    OR new.payment_status IS DISTINCT FROM old.payment_status OR new.history IS DISTINCT FROM old.history
    OR new.service IS DISTINCT FROM old.service THEN
    RAISE EXCEPTION 'Solo puedes actualizar los datos de contacto y entrega';
  END IF;
  RETURN new;
END;
$$;
CREATE TRIGGER guard_customer_order_update
BEFORE UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.guard_customer_order_update();

DROP POLICY IF EXISTS "visitors submit bounded requests" ON public.requests;
CREATE POLICY "customers read own requests" ON public.requests FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "customers submit own requests" ON public.requests FOR INSERT TO authenticated WITH CHECK (
  user_id = auth.uid() AND status = 'pending' AND code ~ '^SOL-[0-9a-f-]{36}$'
  AND char_length(business) BETWEEN 1 AND 200 AND char_length(contact) BETWEEN 1 AND 200
  AND phone ~ '^9[0-9]{8}$' AND char_length(address) BETWEEN 1 AND 500
  AND char_length(zone) BETWEEN 1 AND 100 AND char_length(delivery_date) BETWEEN 1 AND 40
  AND jsonb_array_length(items) <= 100 AND octet_length(items::text) <= 100000
  AND (jsonb_array_length(items) > 0 OR attachment_path IS NOT NULL)
  AND (attachment_path IS NULL OR (attachment_path ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|pdf|txt|doc|docx)$' AND split_part(attachment_path, '/', 1) = user_id::text))
  AND coalesce(char_length(attachment_name), 0) <= 255
);
CREATE POLICY "customers update own pending requests" ON public.requests FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid() AND status = 'pending' AND code ~ '^SOL-[0-9a-f-]{36}$');

DROP POLICY IF EXISTS "visitors upload request attachments" ON storage.objects;
CREATE POLICY "customers upload own request attachments" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  bucket_id = 'request-attachments'
  AND name ~ '^[0-9a-f-]{36}/[0-9a-f-]{36}/[0-9a-f-]{36}\.(jpg|jpeg|png|webp|pdf|txt|doc|docx)$'
  AND (storage.foldername(name))[1] = auth.uid()::text
);
CREATE POLICY "customers read own request attachments" ON storage.objects FOR SELECT TO authenticated USING (
  bucket_id = 'request-attachments' AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE OR REPLACE FUNCTION public.create_order(p jsonb)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE c text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión para hacer un pedido'; END IF;
  IF p IS NULL OR jsonb_typeof(p -> 'items') <> 'array' OR jsonb_array_length(p -> 'items') < 1 OR jsonb_array_length(p -> 'items') > 100 OR octet_length((p -> 'items')::text) > 100000 THEN
    RAISE EXCEPTION 'La lista del pedido no es válida';
  END IF;
  IF char_length(coalesce(p ->> 'business', '')) NOT BETWEEN 1 AND 200 OR char_length(coalesce(p ->> 'contact', '')) NOT BETWEEN 1 AND 200 OR coalesce(p ->> 'phone', '') !~ '^9[0-9]{8}$' THEN
    RAISE EXCEPTION 'Revisa los datos del negocio y el celular';
  END IF;
  IF coalesce(p ->> 'service', '') NOT IN ('taxi_delivery', 'minivan_delivery') THEN RAISE EXCEPTION 'Tipo de entrega no válido'; END IF;
  INSERT INTO public.orders (user_id, business, contact, phone, service, items, subtotal, service_fee, shipping_fee, total, weight_kg, packages,
    payment_plan, payment_method, delivery_date, slot, zone, address, taxi, history)
  VALUES (auth.uid(), p ->> 'business', p ->> 'contact', p ->> 'phone', p ->> 'service', p -> 'items',
    (p ->> 'subtotal')::numeric, (p ->> 'service_fee')::numeric, (p ->> 'shipping_fee')::numeric, (p ->> 'total')::numeric,
    (p ->> 'weight_kg')::numeric, (p ->> 'packages')::int, p ->> 'payment_plan', p ->> 'payment_method',
    nullif(p ->> 'delivery_date', '')::date, p ->> 'slot', p ->> 'zone', p ->> 'address', p -> 'taxi',
    jsonb_build_array(jsonb_build_object('status', 'received', 'at', now())))
  RETURNING code INTO c;
  RETURN c;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.create_order(jsonb) FROM anon;
GRANT EXECUTE ON FUNCTION public.create_order(jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_order_by_code(_code text)
RETURNS SETOF orders
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.orders
  WHERE upper(code) = upper(trim(_code)) AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  LIMIT 1;
$$;
REVOKE EXECUTE ON FUNCTION public.get_order_by_code(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_order_by_code(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_order_photos(_code text)
RETURNS SETOF order_items_photos
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.* FROM public.order_items_photos p
  JOIN public.orders o ON o.code = p.order_code
  WHERE upper(p.order_code) = upper(trim(_code)) AND (o.user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'))
  ORDER BY p.item_index;
$$;
REVOKE EXECUTE ON FUNCTION public.get_order_photos(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.get_order_photos(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.respond_photo(_code text, _item_index integer, _approve boolean, _comment text DEFAULT NULL::text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE o public.orders; new_items jsonb; sub numeric; n_items int; n_ok int; st text;
BEGIN
  SELECT * INTO o FROM public.orders WHERE upper(code) = upper(trim(_code)) AND (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
  IF o.id IS NULL THEN RAISE EXCEPTION 'pedido no encontrado'; END IF;
  IF o.status <> 'purchasing' THEN RAISE EXCEPTION 'el pedido ya no está en compra'; END IF;
  UPDATE public.order_items_photos SET status = CASE WHEN _approve THEN 'aprobado' ELSE 'cambiar' END,
    client_comment = CASE WHEN _approve THEN NULL ELSE left(coalesce(_comment, ''), 200) END,
    responded_at = now(), updated_at = now()
  WHERE order_code = o.code AND item_index = _item_index AND status = 'pendiente';
  IF NOT FOUND THEN RAISE EXCEPTION 'foto no disponible'; END IF;

  SELECT coalesce(jsonb_agg(CASE WHEN p.status = 'aprobado' AND p.real_price IS NOT NULL
      THEN e.v || jsonb_build_object('unitPrice', p.real_price) ELSE e.v END ORDER BY e.i), '[]'::jsonb)
    INTO new_items
  FROM jsonb_array_elements(o.items) WITH ORDINALITY AS e(v, i)
  LEFT JOIN public.order_items_photos p ON p.order_code = o.code AND p.item_index = e.i - 1;

  SELECT coalesce(sum((v ->> 'qty')::numeric * (v ->> 'unitPrice')::numeric), 0) INTO sub FROM jsonb_array_elements(new_items) v;
  n_items := jsonb_array_length(o.items);
  SELECT count(*) INTO n_ok FROM public.order_items_photos WHERE order_code = o.code AND status = 'aprobado';
  st := CASE WHEN n_ok >= n_items THEN 'staging' ELSE o.status END;

  UPDATE public.orders SET items = new_items, subtotal = sub, total = sub + service_fee + shipping_fee, status = st,
    history = CASE WHEN st <> o.status THEN history || jsonb_build_array(jsonb_build_object('status', st, 'at', now())) ELSE history END
  WHERE id = o.id;
  RETURN st;
END;
$$;
REVOKE EXECUTE ON FUNCTION public.respond_photo(text, integer, boolean, text) FROM anon;
GRANT EXECUTE ON FUNCTION public.respond_photo(text, integer, boolean, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;
CREATE TRIGGER touch_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();