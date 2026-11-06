import type { ReactNode } from "react";

export const inputCls = "h-11 w-full rounded-xl border bg-card px-3 text-sm outline-none focus:ring-2 focus:ring-ring aria-[invalid=true]:border-destructive";

export function Field({ label, error, children, required }: { label: string; error?: string; children: ReactNode; required?: boolean }) {
  return (
    <label className="block space-y-1">
      <span className="text-sm font-medium">{label}{required && <span className="text-primary"> *</span>}</span>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </label>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl border bg-card p-5 shadow-sm ${className}`}>{children}</div>;
}

/** Valida campos requeridos; devuelve mensajes en español. */
export function requireFields(values: Record<string, string>, keys: string[]) {
  const e: Record<string, string> = {};
  for (const k of keys) if (!values[k]?.trim()) e[k] = "Este campo es obligatorio";
  if (values.phone && !/^9\d{8}$/.test(values.phone.replace(/\s/g, ""))) e.phone = "Ingresa un celular válido de 9 dígitos";
  return e;
}
