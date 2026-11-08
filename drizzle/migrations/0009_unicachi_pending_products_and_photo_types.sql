ALTER TABLE public.products ADD COLUMN photo_type text;
ALTER TABLE public.products ADD CONSTRAINT products_photo_type_valid CHECK (photo_type IS NULL OR photo_type IN ('puesto','referencial'));
COMMENT ON COLUMN public.products.photo_type IS 'Origin label of the product photo; null until explicitly chosen.';
ALTER POLICY "public reads active products" ON public.products USING ((active AND price > 0) OR public.has_role(auth.uid(), 'admin'));
DO $$ DECLARE definition text; BEGIN
 SELECT pg_get_functiondef('public.validate_form_record()'::regprocedure) INTO definition;
 definition := replace(definition, 'IF k=''price'' OR (k=''real_price'' AND v IS NOT NULL) THEN', 'IF (k=''price'' AND NOT (TG_TABLE_NAME=''products'' AND n->>''availability''=''por_confirmar'' AND v=''0'')) OR (k=''real_price'' AND v IS NOT NULL) THEN');
 EXECUTE definition;
 SELECT pg_get_functiondef('public.validate_admin_catalog()'::regprocedure) INTO definition;
 definition := replace(definition, 'IF new.weight_kg<=0 OR new.weight_kg>750 THEN', 'IF (new.weight_kg<=0 AND NOT (new.weight_kg=0 AND new.price=0 AND new.availability=''por_confirmar'')) OR new.weight_kg>750 THEN');
 EXECUTE definition;
END $$;
CREATE FUNCTION public.validate_pending_product() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$ BEGIN
 IF new.price < 0 OR new.price >= 1000 OR (new.price=0 AND new.availability<>'por_confirmar') THEN RAISE EXCEPTION 'Precio mayor que 0 y menor que 1000; usa 0 solo mientras esté por confirmar'; END IF;
 IF new.weight_kg=0 AND NOT (new.price=0 AND new.availability='por_confirmar') THEN RAISE EXCEPTION 'Completa el peso antes de publicar el precio'; END IF;
 RETURN new;
END $$;
CREATE TRIGGER validate_pending_product BEFORE INSERT OR UPDATE OF price,availability,weight_kg ON public.products FOR EACH ROW EXECUTE FUNCTION public.validate_pending_product();
CREATE FUNCTION public.guard_pending_order_products() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$ BEGIN
 IF EXISTS (SELECT 1 FROM jsonb_array_elements(new.items) item JOIN public.products p ON p.id=item->>'productId' WHERE p.price=0 OR NOT p.active) THEN RAISE EXCEPTION 'Hay productos pendientes de precio o no disponibles en el pedido'; END IF;
 RETURN new;
END $$;
REVOKE ALL ON FUNCTION public.guard_pending_order_products() FROM PUBLIC,anon,authenticated;
CREATE TRIGGER guard_pending_order_products BEFORE INSERT ON public.orders FOR EACH ROW EXECUTE FUNCTION public.guard_pending_order_products();