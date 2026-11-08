import { z } from "zod";
import { ZONES } from "./data";

export const digits = (s: string) => s.replace(/\D/g, "");
export const formatPlate = (s: string) => { const v = s.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); return v.length > 3 ? `${v.slice(0, 3)}-${v.slice(3)}` : v; };
export const phoneSchema = z.string().regex(/^9\d{8}$/, "Ingresa 9 dígitos que empiecen con 9");
export const optionalPhoneSchema = z.union([z.literal(""), phoneSchema]);
export const personSchema = z.string().trim().min(3, "Usa entre 3 y 60 caracteres").max(60, "Máximo 60 caracteres").regex(/^[\p{L} ]+$/u, "Solo se permiten letras y espacios");
export const businessSchema = z.string().trim().min(3, "Usa entre 3 y 60 caracteres").max(60, "Máximo 60 caracteres");
export const plateSchema = z.string().regex(/^[A-Z][A-Z0-9][A-Z]-\d{3}$/, "Usa ABC-123 o A1B-234");
export const addressSchema = z.string().trim().min(8, "La dirección debe tener de 8 a 120 caracteres").max(120, "Máximo 120 caracteres").refine((v) => /\p{L}/u.test(v) && /\d/.test(v), "Incluye al menos una letra y un número, por ejemplo Av. Los Álamos 123");
export const referenceSchema = z.string().trim().min(5, "La referencia es obligatoria: de 5 a 120 caracteres").max(120, "Máximo 120 caracteres");
export const zoneSchema = z.enum(ZONES, { errorMap: () => ({ message: "Elige una zona atendida" }) });
export const quantitySchema = z.number({ invalid_type_error: "Ingresa una cantidad entera de 1 a 50" }).int("Solo cantidades enteras").min(1, "Mínimo 1 por producto").max(50, "Máximo 50 por producto");
export const priceSchema = z.number({ invalid_type_error: "Ingresa un precio válido" }).finite("Ingresa un precio válido").gt(0, "El precio debe ser mayor que 0").lt(1000, "El precio debe ser menor que 1000");
export const dniSchema = z.string().regex(/^\d{8}$/, "El DNI debe tener 8 dígitos");
export const rucSchema = z.string().regex(/^(10|20)\d{9}$/, "El RUC debe tener 11 dígitos y empezar con 10 o 20");
export const documentSchema = z.object({ docType: z.enum(["DNI", "RUC"], { errorMap: () => ({ message: "Elige DNI o RUC" }) }), docNumber: z.string() }).superRefine((v, ctx) => {
  const r = (v.docType === "RUC" ? rucSchema : dniSchema).safeParse(v.docNumber);
  if (!r.success) ctx.addIssue({ code: "custom", path: ["docNumber"], message: r.error.issues[0]?.message ?? "Documento inválido" });
});
export function limaToday(now = new Date()) { return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Lima", year: "numeric", month: "2-digit", day: "2-digit" }).format(now); }
export function deliveryBounds(now = new Date()) {
  const today = new Date(`${limaToday(now)}T12:00:00Z`);
  const day = (n: number) => new Date(today.getTime() + n * 86400000).toISOString().slice(0, 10);
  return { min: day(1), max: day(14) };
}
export function validDeliveryDate(value: string, now = new Date()) {
  if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2})?$/.test(value)) return false;
  const day = value.slice(0, 10), d = new Date(`${day}T12:00:00Z`), { min, max } = deliveryBounds(now);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === day && d.getUTCDay() !== 0 && day >= min && day <= max;
}
export const deliveryDateSchema = z.string().refine((v) => validDeliveryDate(v), "Elige desde mañana hasta 14 días después, sin domingos");
export function nextDeliveryDate() { const { min } = deliveryBounds(); return new Date(`${min}T12:00:00Z`).getUTCDay() === 0 ? new Date(new Date(`${min}T12:00:00Z`).getTime() + 86400000).toISOString().slice(0, 10) : min; }
export const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const photoSchema = z.object({ type: z.string(), size: z.number(), name: z.string() }).superRefine((v, ctx) => {
  if (!PHOTO_TYPES.includes(v.type) || !/\.(jpe?g|png|webp)$/i.test(v.name)) ctx.addIssue({ code: "custom", message: "Solo fotos JPG, PNG o WEBP" });
  if (v.size > 5 * 1024 * 1024) ctx.addIssue({ code: "custom", message: "La foto debe pesar como máximo 5 MB" });
  if (v.size === 0) ctx.addIssue({ code: "custom", message: "La foto está vacía" });
});
export const attachmentSchema = z.object({ type: z.string(), size: z.number(), name: z.string() }).superRefine((v, ctx) => {
  if (v.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|svg)$/i.test(v.name)) { const r = photoSchema.safeParse(v); if (!r.success) r.error.issues.forEach((i) => ctx.addIssue({ code: "custom", message: i.message })); }
  else if (!/\.(pdf|txt|doc|docx)$/i.test(v.name) || v.size === 0 || v.size > 10 * 1024 * 1024) ctx.addIssue({ code: "custom", message: "Usa un documento PDF, TXT, DOC o DOCX de hasta 10 MB" });
});
export function fieldErrors(schema: z.ZodTypeAny, values: unknown): Record<string, string> {
  const r = schema.safeParse(values); if (r.success) return {};
  return Object.fromEntries(r.error.issues.map((i) => [i.path.join("."), i.message]).reverse());
}
export const profileSchema = z.object({ business: businessSchema, owner: personSchema, phone: phoneSchema, docType: z.string(), docNumber: z.string() }).superRefine((v, ctx) => { const r = documentSchema.safeParse(v); if (!r.success) r.error.issues.forEach((i) => ctx.addIssue(i)); });
export const accountAddressSchema = z.object({ zone: zoneSchema, line: addressSchema, ref: referenceSchema });
export const taxiSchema = z.object({ driver: personSchema, plate: plateSchema, phone: phoneSchema });
// Registration mirrors the auth server policy (min 8, no character classes). Login only requires a value so older accounts keep working.
export const registerSchema = z.object({ phone: phoneSchema, password: z.string().min(8, "Usa al menos 8 caracteres").max(72, "Máximo 72 caracteres") });
export const loginSchema = z.object({ phone: phoneSchema, password: z.string().min(1, "Escribe tu contraseña").max(72, "Máximo 72 caracteres") });
export const requestItemSchema = z.object({ name: z.string().trim().min(1, "Escribe el producto").max(200, "Máximo 200 caracteres"), qty: z.string().refine((v) => quantitySchema.safeParse(Number(v)).success, "Cantidad entera de 1 a 50"), unit: z.enum(["Saco", "Jaba", "Caja", "Malla", "Atado", "Kilos"], { errorMap: () => ({ message: "Elige una unidad válida" }) }), quality: z.enum(["Primera", "Comercial", "Económica"], { errorMap: () => ({ message: "Elige una calidad válida" }) }), vendor: z.string().max(100), notes: z.string().max(1000, "Máximo 1000 caracteres") });
export const requestSchema = z.object({ business: businessSchema, contact: personSchema, phone: phoneSchema, address: addressSchema, reference: referenceSchema, zone: zoneSchema, delivery_date: deliveryDateSchema, items: z.array(requestItemSchema).max(100, "Máximo 100 productos") });
export const checkoutSchema = z.object({ business: businessSchema, contact: personSchema, phone: phoneSchema, date: deliveryDateSchema, docType: z.string(), doc: z.string(), service: z.enum(["taxi_delivery", "minivan_delivery"]), address: z.string(), reference: z.string(), zone: z.string(), driver: z.string(), plate: z.string(), dphone: z.string(), arrival: z.string(), meeting: z.string(), slot: z.string(), plan: z.string().min(1, "Elige una modalidad"), method: z.string().min(1, "Elige un método"), razon: z.string().max(120, "Máximo 120 caracteres") }).superRefine((v, ctx) => {
  const schemas: Record<string, z.ZodTypeAny> = v.service === "taxi_delivery" ? { driver: personSchema, plate: plateSchema, dphone: phoneSchema, arrival: z.string().regex(/^0[4-8]:[0-5]\d$|^09:00$/, "Entre 04:00 y 09:00 am"), meeting: z.enum(["Puerta 1", "Puerta 2", "Puerta 3", "Estacionamiento A", "Estacionamiento B"]) } : { address: addressSchema, reference: referenceSchema, zone: zoneSchema, slot: z.enum(["Madrugada (05:30 - 07:30 am)", "Mañana (08:00 - 10:30 am)"]) };
  Object.entries(schemas).forEach(([k, s]) => { const r = s.safeParse(v[k as keyof typeof v]); if (!r.success) ctx.addIssue({ code: "custom", path: [k], message: r.error.issues[0]?.message ?? "Revisa este campo" }); });
  const doc = documentSchema.safeParse({ docType: v.docType, docNumber: v.doc }); if (!doc.success) doc.error.issues.forEach((i) => ctx.addIssue({ code: "custom", path: [i.path[0] === "docNumber" ? "doc" : "docType"], message: i.message }));
});
export const opinionSchema = z.object({ zona: zoneSchema, sinAyuda: z.enum(["si", "no"], { errorMap: () => ({ message: "Elige sí o no" }) }), sat: z.number().int().min(1, "Elige tu satisfacción de 1 a 5").max(5), usaria: z.enum(["si", "tal_vez", "no"], { errorMap: () => ({ message: "Elige una respuesta" }) }), serv: z.enum(["tipo1", "tipo2"], { errorMap: () => ({ message: "Elige un tipo de entrega" }) }), precio: z.string().max(50, "Máximo 50 caracteres"), comentario: z.string().max(600, "Máximo 600 caracteres"), whatsapp: optionalPhoneSchema });