CREATE OR REPLACE FUNCTION public.guard_customer_order_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF current_user <> 'authenticated' OR public.has_role(auth.uid(), 'admin') THEN
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