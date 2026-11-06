import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const REQUEST_STATUS = { pending: "Pendiente", quoted: "Cotizada", approved: "Aprobada", rejected: "Rechazada" } as const;
export const requestSchema = z.object({
  business: z.string().trim().min(1).max(200), contact: z.string().trim().min(1).max(200),
  phone: z.string().regex(/^9\d{8}$/), address: z.string().trim().min(1).max(500),
  zone: z.string().min(1).max(100), delivery_date: z.string().min(1).max(40),
  items: z.array(z.object({ name: z.string().trim().min(1).max(200), qty: z.string().refine((v) => Number(v) > 0), unit: z.string().max(50), quality: z.string().max(50), vendor: z.string().max(100), notes: z.string().max(1000) })).max(100),
});
export async function submitRequest(input: z.input<typeof requestSchema>, file?: File) {
  const data = requestSchema.parse(input);
  if (!data.items.length && !file) throw new Error("Agrega tu lista");
  const id = crypto.randomUUID();
  let path: string | null = null;
  if (file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !["jpg", "jpeg", "png", "webp", "pdf", "txt", "doc", "docx"].includes(ext) || file.size > 10 * 1024 * 1024) throw new Error("Usa una imagen o documento de hasta 10 MB");
    path = `${id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("request-attachments").upload(path, file);
    if (error) throw new Error("No se pudo subir el archivo");
  }
  const code = `SOL-${id}`;
  const { error } = await supabase.from("requests").insert({ ...data, code, attachment_path: path, attachment_name: file?.name ?? null });
  if (error) throw new Error("No se pudo guardar la solicitud");
  return code;
}