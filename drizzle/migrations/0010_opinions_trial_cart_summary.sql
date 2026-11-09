ALTER TABLE public.opinions ADD COLUMN IF NOT EXISTS carrito_resumen text;
COMMENT ON COLUMN public.opinions.carrito_resumen IS 'Resumen del carrito de prueba del Experimento 2, sin crear un pedido.';