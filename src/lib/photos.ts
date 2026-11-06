import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getPhotoUrls } from "./photos.functions";

export type ItemPhoto = {
  item_index: number; photo_url: string | null; real_price: number | null; status: "pendiente" | "aprobado" | "cambiar";
  client_comment: string | null; uploaded_at: string; responded_at: string | null;
};

/** Minutos que tardó el cliente en responder una foto (null si aún no responde). */
export function responseMinutes(p: Pick<ItemPhoto, "uploaded_at" | "responded_at">): number | null {
  if (!p.responded_at) return null;
  return Math.max(0, Math.round((new Date(p.responded_at).getTime() - new Date(p.uploaded_at).getTime()) / 60000));
}

export function useOrderPhotos(code?: string, poll = true) {
  return useQuery({
    queryKey: ["photos", code?.toUpperCase()], enabled: !!code, refetchInterval: poll ? 15_000 : false,
    queryFn: async () => {
      const [{ data, error }, urls] = await Promise.all([
        supabase.rpc("get_order_photos", { _code: code! }),
        getPhotoUrls({ data: { code: code! } }),
      ]);
      if (error) throw error;
      return ((data ?? []) as unknown as ItemPhoto[]).map((p) => ({ ...p, real_price: p.real_price == null ? null : Number(p.real_price), url: urls[p.item_index] }));
    },
  });
}

export function usePhotoActions(code: string) {
  const qc = useQueryClient();
  const refresh = () => Promise.all([qc.invalidateQueries({ queryKey: ["photos", code.toUpperCase()] }), qc.invalidateQueries({ queryKey: ["order", code.toUpperCase()] }), qc.invalidateQueries({ queryKey: ["orders"] })]);
  return {
    upload: async (itemIndex: number, file: File, realPrice: number) => {
      const path = `${code}/${itemIndex}-${crypto.randomUUID()}.jpg`;
      const up = await supabase.storage.from("order-photos").upload(path, file, { contentType: file.type || "image/jpeg" });
      if (up.error) throw up.error;
      const now = new Date().toISOString();
      const { error } = await supabase.from("order_items_photos").upsert(
        { order_code: code, item_index: itemIndex, photo_url: path, real_price: realPrice, status: "pendiente", client_comment: null, uploaded_at: now, responded_at: null, updated_at: now },
        { onConflict: "order_code,item_index" },
      );
      await refresh();
      if (error) throw error;
    },
    respond: async (itemIndex: number, approve: boolean, comment?: string) => {
      const { error } = await supabase.rpc("respond_photo", { _code: code, _item_index: itemIndex, _approve: approve, _comment: comment ?? undefined });
      await refresh();
      if (error) throw error;
    },
  };
}
