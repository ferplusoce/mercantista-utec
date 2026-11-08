CREATE OR REPLACE FUNCTION public.admin_dashboard() RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public AS $$ DECLARE result jsonb; today date := (now() AT TIME ZONE 'America/Lima')::date; week_start date := date_trunc('week',now() AT TIME ZONE 'America/Lima')::date; BEGIN
 IF auth.uid() IS NULL OR NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'No tienes permisos de administrador'; END IF;
 WITH valid AS (SELECT *, (created_at AT TIME ZONE 'America/Lima')::date AS day FROM public.orders WHERE status<>'cancelled'), tops AS (SELECT i->>'productId' AS id, max(i->>'name') AS name,sum((i->>'qty')::numeric) AS units FROM valid CROSS JOIN LATERAL jsonb_array_elements(items) i GROUP BY i->>'productId' ORDER BY units DESC LIMIT 8), daily AS (SELECT day AS date,count(*) AS orders,sum(total) AS sales FROM valid WHERE day BETWEEN week_start AND today GROUP BY day ORDER BY day)
 SELECT jsonb_build_object('today',(SELECT count(*) FROM valid WHERE day=today),'week',(SELECT count(*) FROM valid WHERE day BETWEEN week_start AND today),'revenue',coalesce((SELECT sum(total) FROM valid),0),'collected',coalesce((SELECT sum(total) FROM valid WHERE payment_status='paid'),0),'average',coalesce((SELECT avg(total) FROM valid),0),'clients',(SELECT count(DISTINCT user_id) FROM valid WHERE day BETWEEN today-29 AND today),'totalOrders',(SELECT count(*) FROM valid),'top',coalesce((SELECT jsonb_agg(to_jsonb(tops)) FROM tops),'[]'::jsonb),'days',coalesce((SELECT jsonb_agg(to_jsonb(daily)) FROM daily),'[]'::jsonb)) INTO result;
 RETURN result;
END $$;
REVOKE ALL ON FUNCTION public.admin_dashboard() FROM PUBLIC,anon;
GRANT EXECUTE ON FUNCTION public.admin_dashboard() TO authenticated;
CREATE OR REPLACE FUNCTION public.validate_admin_catalog() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF TG_TABLE_NAME='categories' THEN
  IF TG_OP='INSERT' OR new.name IS DISTINCT FROM old.name THEN IF length(btrim(new.name)) NOT BETWEEN 1 AND 100 THEN RAISE EXCEPTION 'Nombre de categoría: de 1 a 100 caracteres'; END IF; END IF;
  IF TG_OP='INSERT' OR new.sort_order IS DISTINCT FROM old.sort_order THEN IF new.sort_order NOT BETWEEN 0 AND 999 THEN RAISE EXCEPTION 'Orden de categoría: de 0 a 999'; END IF; END IF;
 ELSIF TG_TABLE_NAME='products' THEN
  IF TG_OP='INSERT' OR new.weight_kg IS DISTINCT FROM old.weight_kg THEN IF new.weight_kg<=0 OR new.weight_kg>750 THEN RAISE EXCEPTION 'Peso mayor que 0 y hasta 750 kg'; END IF; END IF;
  IF TG_OP='INSERT' OR new.format IS DISTINCT FROM old.format THEN IF new.format NOT IN ('Saco','Medio saco','Jaba','Caja','Malla','Atado','Ciento') THEN RAISE EXCEPTION 'Elige un formato válido'; END IF; END IF;
  IF TG_OP='INSERT' OR new.quality IS DISTINCT FROM old.quality THEN IF new.quality NOT IN ('Primera','Segunda','Comercial') THEN RAISE EXCEPTION 'Elige una calidad válida'; END IF; END IF;
  IF TG_OP='INSERT' OR new.availability IS DISTINCT FROM old.availability THEN IF new.availability NOT IN ('disponible','agotado','por_confirmar') THEN RAISE EXCEPTION 'Disponibilidad inválida'; END IF; END IF;
  IF TG_OP='INSERT' OR new.description IS DISTINCT FROM old.description THEN IF length(new.description)>1000 THEN RAISE EXCEPTION 'Descripción: máximo 1000 caracteres'; END IF; END IF;
 ELSIF TG_TABLE_NAME='vendors' THEN
  IF TG_OP='INSERT' OR new.stall IS DISTINCT FROM old.stall THEN IF length(btrim(new.stall)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Ingresa el número de puesto'; END IF; END IF;
  IF TG_OP='INSERT' OR new.pavilion IS DISTINCT FROM old.pavilion THEN IF length(btrim(new.pavilion)) NOT BETWEEN 1 AND 200 THEN RAISE EXCEPTION 'Ingresa el pabellón'; END IF; END IF;
 END IF;
 RETURN new;
END $$;
CREATE TRIGGER validate_admin_categories BEFORE INSERT OR UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.validate_admin_catalog();
CREATE TRIGGER validate_admin_products BEFORE INSERT OR UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_admin_catalog();
CREATE TRIGGER validate_admin_vendors BEFORE INSERT OR UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.validate_admin_catalog();