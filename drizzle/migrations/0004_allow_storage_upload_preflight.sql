ALTER POLICY "enforce uploaded photo formats and sizes" ON storage.objects WITH CHECK (
 bucket_id NOT IN ('product-images','order-photos','request-attachments') OR (metadata IS NULL AND (lower(name) ~ '\.(jpg|jpeg|png|webp)$' OR (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$'))) OR
 (coalesce((metadata->>'size')::bigint,0)>0 AND (
 (lower(name) ~ '\.(jpg|jpeg|png|webp)$' AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') AND (metadata->>'size')::bigint<=5242880) OR
 (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$' AND metadata->>'mimetype' IN ('application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document') AND (metadata->>'size')::bigint<=10485760)
 )));
ALTER POLICY "enforce updated photo formats and sizes" ON storage.objects WITH CHECK (
 bucket_id NOT IN ('product-images','order-photos','request-attachments') OR (metadata IS NULL AND (lower(name) ~ '\.(jpg|jpeg|png|webp)$' OR (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$'))) OR
 (coalesce((metadata->>'size')::bigint,0)>0 AND (
 (lower(name) ~ '\.(jpg|jpeg|png|webp)$' AND metadata->>'mimetype' IN ('image/jpeg','image/png','image/webp') AND (metadata->>'size')::bigint<=5242880) OR
 (bucket_id='request-attachments' AND lower(name) ~ '\.(pdf|txt|doc|docx)$' AND metadata->>'mimetype' IN ('application/pdf','text/plain','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document') AND (metadata->>'size')::bigint<=10485760)
 )));