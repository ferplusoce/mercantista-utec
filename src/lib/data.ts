// Tipos y constantes de Mercantista. El catálogo vive en Lovable Cloud (ver catalog.ts).
export type Category = string;
export type CategoryInfo = { id: string; name: string; desc: string; image: string | null; imagePath: string | null; sortOrder: number };

export const FORMATS = ["Saco", "Medio saco", "Jaba", "Caja", "Malla", "Atado", "Ciento"] as const;

export type Vendor = {
  id: string; name: string; stall: string; pavilion: string; contact: string; phone: string;
  specialty: string; schedule: string; verified: boolean; active: boolean; rating: number;
};

export type Availability = "disponible" | "agotado" | "por_confirmar";
export type Product = {
  id: string; name: string; category: Category; vendorId: string; unit: string; format: (typeof FORMATS)[number];
  weightKg: number; price: number; quality: "Primera" | "Segunda" | "Comercial"; availability: Availability; desc: string;
  /** URL lista para mostrar (o null si no tiene foto). */
  image: string | null; imagePath: string | null; active: boolean;
};

export const ZONES = ["Lurín Cercado", "Lurín - Julio C. Tello", "Lurín - Huertos de Lurín", "Lurín - Km 40 / Arica", "Villa El Salvador (limítrofe)", "Pachacámac (zonas bajas)"] as const;
export const SLOTS = ["Madrugada (05:30 - 07:30 am)", "Mañana (08:00 - 10:30 am)"] as const;

export const WHATSAPP = "51987654321";
export const waLink = (msg: string, num: string = WHATSAPP) => `https://wa.me/${num.replace(/\D/g, "")}?text=${encodeURIComponent(msg)}`;
export const soles = (n: number) => `S/ ${n.toFixed(2)}`;
