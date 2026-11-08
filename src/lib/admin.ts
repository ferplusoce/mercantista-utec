import { z } from "zod";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FORMATS } from "./data";
import { businessSchema, optionalPhoneSchema, personSchema, priceSchema } from "./validation";

export const hasAdminRole = (roles: readonly string[]) => roles.includes("admin");
export const productFormSchema = z.object({ name: z.string().trim().min(1, "Escribe el producto").max(200, "Máximo 200 caracteres"), category: z.string().min(1, "Elige una categoría"), vendorId: z.string().min(1, "Elige un puesto"), unit: z.string().trim().min(1, "Escribe la presentación").max(100, "Máximo 100 caracteres"), format: z.enum(FORMATS), weightKg: z.number().finite().gt(0, "El peso debe ser mayor que 0").max(750, "Máximo 750 kg"), price: priceSchema, quality: z.enum(["Primera", "Segunda", "Comercial"]), availability: z.enum(["disponible", "agotado", "por_confirmar"]), desc: z.string().max(1000, "Máximo 1000 caracteres"), active: z.boolean() });
export const vendorFormSchema = z.object({ name: businessSchema, stall: z.string().trim().min(1, "Ingresa el número de puesto").max(200), pavilion: z.string().trim().min(1, "Ingresa el pabellón").max(200), contact: z.union([z.literal(""), personSchema]), phone: optionalPhoneSchema, specialty: z.string().max(200), schedule: z.string().max(200), active: z.boolean() });
export const categoryFormSchema = z.object({ name: z.string().trim().min(1, "Escribe el nombre").max(100, "Máximo 100 caracteres"), sortOrder: z.number().int("Solo números enteros").min(0, "Mínimo 0").max(999, "Máximo 999") });
export type ProductForm = z.infer<typeof productFormSchema>;
export type VendorForm = z.infer<typeof vendorFormSchema>;

const dashboardSchema = z.object({ today: z.number(), week: z.number(), revenue: z.number(), collected: z.number(), average: z.number(), clients: z.number(), totalOrders: z.number(), top: z.array(z.object({ id: z.string(), name: z.string(), units: z.number() })), days: z.array(z.object({ date: z.string(), orders: z.number(), sales: z.number() })) });
export const adminDashboardOptions = queryOptions({ queryKey: ["admin", "dashboard"], queryFn: async () => { const { data, error } = await supabase.rpc("admin_dashboard"); if (error) throw error; return dashboardSchema.parse(data); }, staleTime: 30000, refetchInterval: 30000 });
export async function requireAdminRole() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) throw new Error("Debes iniciar sesión");
  const { data, error: roleError } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (roleError || !data) throw new Error("No tienes permisos de administrador");
}