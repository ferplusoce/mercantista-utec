ALTER POLICY "public reads settings" ON public.settings USING (id = 1);

ALTER POLICY "public reads product images" ON storage.objects USING (
  bucket_id = 'product-images'
  AND (
    EXISTS (SELECT 1 FROM public.products p WHERE p.image_url = storage.objects.name AND p.active)
    OR EXISTS (SELECT 1 FROM public.categories c WHERE c.image_url = storage.objects.name)
    OR public.has_role(auth.uid(), 'admin'::public.app_role)
  )
);

COMMENT ON POLICY "public reads settings" ON public.settings IS 'Public reads are limited to the current customer-facing tariffs and support contact (id 1); administrators retain their role-scoped policy.';
COMMENT ON POLICY "public reads product images" ON storage.objects IS 'Only images referenced by active public products or public categories can be signed by customers; administrators may read other catalog-bucket images. Customer order photos and attachments are not covered.';