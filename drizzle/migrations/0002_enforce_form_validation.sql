ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS reference text, ADD COLUMN IF NOT EXISTS doc_type text, ADD COLUMN IF NOT EXISTS doc_number text;
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS reference text;
CREATE OR REPLACE FUNCTION public.valid_served_zone(v text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(v = ANY(ARRAY['Lurín Cercado','Lurín - Julio C. Tello','Lurín - Huertos de Lurín','Lurín - Km 40 / Arica','Villa El Salvador (limítrofe)','Pachacámac (zonas bajas)']),false) $$;
CREATE OR REPLACE FUNCTION public.valid_person(v text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(length(btrim(v)) BETWEEN 3 AND 60 AND btrim(v) ~ '^[[:alpha:] ]+$',false) $$;
CREATE OR REPLACE FUNCTION public.valid_address(v text) RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path=public AS $$ SELECT coalesce(length(btrim(v)) BETWEEN 8 AND 120 AND v ~ '[[:alpha:]]' AND v ~ '[0-9]',false) $$;
CREATE OR REPLACE FUNCTION public.validate_delivery_day(v text) RETURNS void LANGUAGE plpgsql SET search_path=public AS $$ DECLARE d date; today date := (now() AT TIME ZONE 'America/Lima')::date; BEGIN
 IF v IS NULL OR v !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}(T[0-9]{2}:[0-9]{2})?$' THEN RAISE EXCEPTION 'Elige una fecha de entrega válida'; END IF;
 BEGIN d := left(v,10)::date; EXCEPTION WHEN OTHERS THEN RAISE EXCEPTION 'Elige una fecha de entrega válida'; END;
 IF d < today+1 OR d > today+14 OR extract(dow FROM d)=0 THEN RAISE EXCEPTION 'Elige desde mañana hasta 14 días después, sin domingos'; END IF;
END $$;
CREATE OR REPLACE FUNCTION public.validate_form_record() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
DECLARE n jsonb:=to_jsonb(new); o jsonb:='{}'; k text; v text; item jsonb; qty numeric; price numeric; initial_profile boolean:=false;
BEGIN
 IF TG_OP='UPDATE' THEN o:=to_jsonb(old); END IF;
 initial_profile:=TG_TABLE_NAME='profiles' AND TG_OP='INSERT' AND pg_trigger_depth()>1;
 FOR k,v IN SELECT key,value FROM jsonb_each_text(n) LOOP
  IF TG_OP='UPDATE' AND n->k IS NOT DISTINCT FROM o->k THEN CONTINUE; END IF;
  IF k IN ('phone','whatsapp') THEN
   IF (TG_TABLE_NAME IN ('opinions','vendors') AND coalesce(v,'')='') OR (initial_profile AND coalesce(v,'')='') THEN CONTINUE; END IF;
   IF TG_TABLE_NAME='settings' THEN
    IF coalesce(v,'') !~ '^519[0-9]{8}$' THEN RAISE EXCEPTION 'WhatsApp: ingresa 9 dígitos que empiecen con 9'; END IF;
   ELSIF coalesce(v,'') !~ '^9[0-9]{8}$' THEN RAISE EXCEPTION 'Celular: ingresa 9 dígitos que empiecen con 9'; END IF;
  END IF;
  IF k IN ('business_name','business') OR (k='name' AND TG_TABLE_NAME='vendors') THEN
   IF initial_profile AND coalesce(v,'')='' THEN CONTINUE; END IF;
   IF coalesce(length(btrim(v)),0) NOT BETWEEN 3 AND 60 THEN RAISE EXCEPTION 'Bodega: usa entre 3 y 60 caracteres'; END IF;
  END IF;
  IF k IN ('owner_name','driver') OR (k='contact' AND TG_TABLE_NAME IN ('orders','requests','vendors')) THEN
   IF (initial_profile OR TG_TABLE_NAME='vendors') AND coalesce(v,'')='' THEN CONTINUE; END IF;
   IF NOT public.valid_person(v) THEN RAISE EXCEPTION 'Nombre: solo letras y espacios, entre 3 y 60 caracteres'; END IF;
  END IF;
  IF k='plate' AND coalesce(v,'') !~ '^[A-Z][A-Z0-9][A-Z]-[0-9]{3}$' THEN RAISE EXCEPTION 'Placa: usa ABC-123 o A1B-234'; END IF;
  IF (k='line' OR k='address') AND NOT (TG_TABLE_NAME='orders' AND new.service='taxi_delivery') THEN
   IF NOT public.valid_address(v) THEN RAISE EXCEPTION 'Dirección: de 8 a 120 caracteres, con una letra y un número'; END IF;
  END IF;
  IF k IN ('ref','reference') AND NOT (TG_TABLE_NAME='orders' AND n->>'service'='taxi_delivery') THEN
   IF coalesce(length(btrim(v)),0) NOT BETWEEN 5 AND 120 THEN RAISE EXCEPTION 'Referencia obligatoria: de 5 a 120 caracteres'; END IF;
  END IF;
  IF (k='zone' OR (k='zona' AND TG_TABLE_NAME='opinions')) AND NOT (TG_TABLE_NAME='orders' AND n->>'service'='taxi_delivery') THEN
   IF NOT public.valid_served_zone(v) THEN RAISE EXCEPTION 'Elige una zona atendida'; END IF;
  END IF;
  IF k='delivery_date' THEN PERFORM public.validate_delivery_day(v); END IF;
  IF k='price' OR (k='real_price' AND v IS NOT NULL) THEN
   IF coalesce(v,'') !~ '^[0-9]+([.][0-9]+)?$' OR v::numeric<=0 OR v::numeric>=1000 THEN RAISE EXCEPTION 'El precio debe ser mayor que 0 y menor que 1000'; END IF;
  END IF;
  IF k='items' AND TG_TABLE_NAME IN ('orders','requests') THEN
   IF jsonb_typeof(n->k)<>'array' OR jsonb_array_length(n->k)>100 OR octet_length((n->k)::text)>100000 THEN RAISE EXCEPTION 'Lista de productos inválida'; END IF;
   IF TG_TABLE_NAME='orders' AND jsonb_array_length(n->k)=0 THEN RAISE EXCEPTION 'Agrega al menos un producto'; END IF;
   FOR item IN SELECT value FROM jsonb_array_elements(n->k) LOOP
    IF jsonb_typeof(item)<>'object' OR coalesce(item->>'qty','') !~ '^[0-9]+$' THEN RAISE EXCEPTION 'Cantidad entera de 1 a 50 por producto'; END IF;
    qty:=(item->>'qty')::numeric;
    IF qty<1 OR qty>50 THEN RAISE EXCEPTION 'Cantidad entera de 1 a 50 por producto'; END IF;
    IF length(btrim(coalesce(item->>'name',''))) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Escribe el producto'; END IF;
    IF TG_TABLE_NAME='orders' THEN
     IF jsonb_typeof(item->'qty')<>'number' OR coalesce(item->>'unitPrice','') !~ '^[0-9]+([.][0-9]+)?$' THEN RAISE EXCEPTION 'Cantidad o precio inválido'; END IF;
     price:=(item->>'unitPrice')::numeric;
     IF price<=0 OR price>=1000 THEN RAISE EXCEPTION 'El precio debe ser mayor que 0 y menor que 1000'; END IF;
    ELSE
     IF coalesce(item->>'unit','') NOT IN ('Saco','Jaba','Caja','Malla','Atado','Kilos') OR coalesce(item->>'quality','') NOT IN ('Primera','Comercial','Económica') OR length(coalesce(item->>'notes',''))>1000 THEN RAISE EXCEPTION 'Unidad, calidad o notas inválidas'; END IF;
    END IF;
   END LOOP;
  END IF;
  IF k='taxi' AND TG_TABLE_NAME='orders' AND n->>'service'='taxi_delivery' THEN
   IF jsonb_typeof(n->'taxi') IS DISTINCT FROM 'object' OR NOT public.valid_person(n->'taxi'->>'driver') OR coalesce(n->'taxi'->>'plate','') !~ '^[A-Z][A-Z0-9][A-Z]-[0-9]{3}$' OR coalesce(n->'taxi'->>'phone','') !~ '^9[0-9]{8}$' THEN RAISE EXCEPTION 'Revisa nombre, placa y celular del chofer'; END IF;
   IF coalesce(n->'taxi'->>'arrival','') !~ '^0[4-8]:[0-5][0-9]$|^09:00$' OR coalesce(n->'taxi'->>'meeting','') NOT IN ('Puerta 1','Puerta 2','Puerta 3','Estacionamiento A','Estacionamiento B') THEN RAISE EXCEPTION 'Revisa hora y punto de encuentro'; END IF;
  END IF;
 END LOOP;
 IF TG_TABLE_NAME IN ('profiles','orders') AND (TG_OP='INSERT' OR n->'doc_type' IS DISTINCT FROM o->'doc_type' OR n->'doc_number' IS DISTINCT FROM o->'doc_number') THEN
  IF NOT(initial_profile AND coalesce(n->>'doc_number','')='') THEN
   IF coalesce(n->>'doc_type','') NOT IN ('DNI','RUC') OR (n->>'doc_type'='DNI' AND coalesce(n->>'doc_number','') !~ '^[0-9]{8}$') OR (n->>'doc_type'='RUC' AND coalesce(n->>'doc_number','') !~ '^(10|20)[0-9]{9}$') THEN RAISE EXCEPTION 'DNI: 8 dígitos. RUC: 11 dígitos empezando con 10 o 20'; END IF;
  END IF;
 END IF;
 IF TG_TABLE_NAME='settings' AND (TG_OP='INSERT' OR n->'tariffs' IS DISTINCT FROM o->'tariffs') THEN
  IF coalesce(n->'tariffs'->>'taxiFlat','') !~ '^[0-9]+([.][0-9]+)?$' THEN RAISE EXCEPTION 'Tarifa inválida'; END IF;
  price:=(n->'tariffs'->>'taxiFlat')::numeric; IF price<=0 OR price>=1000 THEN RAISE EXCEPTION 'Tarifa mayor que 0 y menor que 1000'; END IF;
  FOR item IN SELECT value FROM jsonb_each(n->'tariffs'->'tramos') LOOP
   IF jsonb_typeof(item)<>'array' OR jsonb_array_length(item)<>3 THEN RAISE EXCEPTION 'Tramo inválido'; END IF;
   FOR v IN SELECT value FROM jsonb_array_elements_text(item) LOOP
    IF v !~ '^[0-9]+([.][0-9]+)?$' OR v::numeric<=0 OR v::numeric>=1000 THEN RAISE EXCEPTION 'Tarifa mayor que 0 y menor que 1000'; END IF;
   END LOOP;
  END LOOP;
 END IF;
 IF TG_TABLE_NAME='opinions' AND TG_OP='INSERT' THEN
  IF n->>'armo_sin_ayuda' IS NULL OR coalesce(n->>'satisfaccion','') NOT IN ('1','2','3','4','5') OR coalesce(n->>'lo_usaria','') NOT IN ('si','tal_vez','no') OR coalesce(n->>'servicio_preferido','') NOT IN ('tipo1','tipo2') OR length(coalesce(n->>'precio_justo',''))>50 OR length(coalesce(n->>'comentario',''))>600 THEN RAISE EXCEPTION 'Revisa las respuestas de la opinión'; END IF;
 END IF;
 RETURN new;
END $$;
CREATE TRIGGER validate_form_profiles BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_addresses BEFORE INSERT OR UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_taxis BEFORE INSERT OR UPDATE ON public.taxis FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_orders BEFORE INSERT OR UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_requests BEFORE INSERT OR UPDATE ON public.requests FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_products BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_vendors BEFORE INSERT OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_settings BEFORE INSERT OR UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_opinions BEFORE INSERT OR UPDATE ON public.opinions FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE TRIGGER validate_form_order_photos BEFORE INSERT OR UPDATE ON public.order_items_photos FOR EACH ROW EXECUTE FUNCTION public.validate_form_record();
CREATE OR REPLACE FUNCTION public.create_order(p jsonb) RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ DECLARE c text; BEGIN
 IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Debes iniciar sesión para hacer un pedido'; END IF;
 IF p IS NULL OR jsonb_typeof(p->'items') IS DISTINCT FROM 'array' OR jsonb_array_length(p->'items') NOT BETWEEN 1 AND 100 OR octet_length((p->'items')::text)>100000 THEN RAISE EXCEPTION 'La lista del pedido no es válida'; END IF;
 IF coalesce(p->>'service','') NOT IN ('taxi_delivery','minivan_delivery') THEN RAISE EXCEPTION 'Tipo de entrega no válido'; END IF;
 INSERT INTO public.orders(user_id,business,contact,phone,service,items,subtotal,service_fee,shipping_fee,total,weight_kg,packages,payment_plan,payment_method,delivery_date,slot,zone,address,taxi,history,reference,doc_type,doc_number)
 VALUES(auth.uid(),p->>'business',p->>'contact',p->>'phone',p->>'service',p->'items',(p->>'subtotal')::numeric,(p->>'service_fee')::numeric,(p->>'shipping_fee')::numeric,(p->>'total')::numeric,(p->>'weight_kg')::numeric,(p->>'packages')::int,p->>'payment_plan',p->>'payment_method',nullif(p->>'delivery_date','')::date,p->>'slot',p->>'zone',p->>'address',p->'taxi',jsonb_build_array(jsonb_build_object('status','received','at',now())),p->>'reference',p->>'doc_type',p->>'doc_number') RETURNING code INTO c;
 RETURN c;
END $$;
CREATE POLICY "enforce uploaded photo formats and sizes" ON storage.objects AS RESTRICTIVE FOR INSERT TO authenticated WITH CHECK (
 bucket_id NOT IN ('product-images','order-photos','request-attachments') OR
 (coalesce((metadata->>'size')::bigint,0)>0 AND (
  (lower(name) ~ '\.(jpg|jpeg|png|webp)$' AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') AND (metadata->>'size')::bigint<=5242880) OR
  (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$' AND metadata->>'mimetype' IN ('application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document') AND (metadata->>'size')::bigint<=10485760)
 )));
CREATE POLICY "enforce updated photo formats and sizes" ON storage.objects AS RESTRICTIVE FOR UPDATE TO authenticated USING(true) WITH CHECK (
 bucket_id NOT IN ('product-images','order-photos','request-attachments') OR
 (coalesce((metadata->>'size')::bigint,0)>0 AND (
  (lower(name) ~ '\.(jpg|jpeg|png|webp)$' AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') AND (metadata->>'size')::bigint<=5242880) OR
  (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$' AND metadata->>'mimetype' IN ('application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document') AND (metadata->>'size')::bigint<=10485760)
 )));