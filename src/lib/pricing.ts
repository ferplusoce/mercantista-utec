export type Tramo = 1 | 2;
export type Tariffs = {
  taxiFlat: number;
  /** Precio total por pedido según peso: hasta 200, hasta 450, hasta 750 kg. */
  tramos: Record<Tramo, [number, number, number]>;
  zoneTramo: Record<string, Tramo>;
  /** Número de WhatsApp de atención al cliente (formato internacional sin +). */
  whatsapp: string;
};

export const DEFAULT_TARIFFS: Tariffs = {
  taxiFlat: 50,
  tramos: { 1: [100, 115, 130], 2: [130.5, 145, 160] },
  zoneTramo: {
    "Lurín Cercado": 1,
    "Lurín - Julio C. Tello": 1,
    "Villa El Salvador (limítrofe)": 1,
    "Lurín - Huertos de Lurín": 2,
    "Lurín - Km 40 / Arica": 2,
    "Pachacámac (zonas bajas)": 2,
  },
  whatsapp: "51987654321",
};

export const MAX_VAN_KG = 750;

export function weightBand(kg: number): 0 | 1 | 2 | -1 {
  if (kg <= 200) return 0;
  if (kg <= 450) return 1;
  if (kg <= MAX_VAN_KG) return 2;
  return -1;
}

/** Servicio 1: precio fijo por pedido (compra, foto de cada producto y subida al taxi). */
export function taxiFee(t: Tariffs = DEFAULT_TARIFFS) {
  return t.taxiFlat;
}

/** Servicio 2: precio total por pedido según tramo y peso (compra, consolidación y flete). */
export function vanFee(opts: { zone: string; kg: number }, t: Tariffs = DEFAULT_TARIFFS) {
  const tramo = t.zoneTramo[opts.zone];
  const band = weightBand(opts.kg);
  if (!tramo || band === -1) return { ok: false as const, tramo, total: 0 };
  return { ok: true as const, tramo, total: t.tramos[tramo][band] };
}
