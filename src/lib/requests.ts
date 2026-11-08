import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

export const REQUEST_STATUS = { pending: "Pendiente", quoted: "Cotizada", approved: "Aprobada", rejected: "Rechazada" } as const;
export { requestSchema } from "./validation";
import { requestSchema, attachmentSchema } from "./validation";
export async function submitRequest(input: z.input<typeof requestSchema>, file: File | undefined, userId: string) {
  if (!/^[0-9a-f-]{36}$/i.test(userId)) throw new Error("Debes iniciar sesión");
  const data = requestSchema.parse(input);
  if (!data.items.length && !file) throw new Error("Agrega tu lista");
  const id = crypto.randomUUID();
  let path: string | null = null;
  if (file) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    attachmentSchema.parse(file);
    path = `${userId}/${id}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("request-attachments").upload(path, file);
    if (error) throw new Error("No se pudo subir el archivo");
  }
  const code = `SOL-${id}`;
  const { error } = await supabase.from("requests").insert({ ...data, code, user_id: userId, attachment_path: path, attachment_name: file?.name ?? null });
  if (error) throw new Error("No se pudo guardar la solicitud");
  return code;
}