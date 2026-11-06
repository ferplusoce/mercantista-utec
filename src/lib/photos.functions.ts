import { createServerFn } from "@tanstack/react-start";

/** Devuelve URLs firmadas (1 h) de las fotos de un pedido. Quien tenga el código del pedido puede verlas. */
export const getPhotoUrls = createServerFn({ method: "POST" })
  .inputValidator((d: { code: string }) => {
    if (typeof d?.code !== "string" || d.code.length > 40) throw new Error("código inválido");
    return { code: d.code.trim().toUpperCase() };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("order_items_photos").select("item_index, photo_url").eq("order_code", data.code);
    if (error) throw new Error("No se pudieron leer las fotos");
    const paths = (rows ?? []).filter((r) => r.photo_url).map((r) => r.photo_url as string);
    if (!paths.length) return {} as Record<number, string>;
    const { data: signed } = await supabaseAdmin.storage.from("order-photos").createSignedUrls(paths, 3600);
    const byPath = new Map((signed ?? []).map((s) => [s.path, s.signedUrl]));
    const out: Record<number, string> = {};
    for (const r of rows ?? []) if (r.photo_url && byPath.get(r.photo_url)) out[r.item_index] = byPath.get(r.photo_url)!;
    return out;
  });
