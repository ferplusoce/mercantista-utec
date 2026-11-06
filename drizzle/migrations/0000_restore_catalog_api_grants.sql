GRANT SELECT ON public.categories, public.vendors, public.products, public.settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.categories, public.vendors, public.products, public.settings TO authenticated;
GRANT ALL ON public.categories, public.vendors, public.products, public.settings TO service_role;
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.top_products(integer, integer) TO anon, authenticated;