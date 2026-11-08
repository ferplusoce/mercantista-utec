import { z } from "zod";

export const photoTypeSchema = z.enum(["puesto", "referencial"]);
export type PhotoType = z.infer<typeof photoTypeSchema>;
export const photoTypeLabel = (type: PhotoType) => type === "puesto" ? "Foto del puesto" : "Foto referencial";
export const isCustomerProduct = (p: { active: boolean; price: number }) => p.active && p.price > 0;
export function matchPhotoId(filename: string, ids: readonly string[]): string {
  const stem = filename.replace(/\.[^.]+$/, "").toLowerCase();
  return ids.find((id) => id.toLowerCase() === stem) ?? "";
}
export const pendingProductPriceSchema = z.number().finite().min(0, "El precio no puede ser negativo").lt(1000, "El precio debe ser menor que 1000");