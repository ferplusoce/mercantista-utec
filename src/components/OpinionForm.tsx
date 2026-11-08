import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { OP_SERVICES, OP_USARIA, OP_ZONES, submitOpinion } from "@/lib/opinions";
import { opinionSchema, fieldErrors, digits } from "@/lib/validation";
import { Card, inputCls } from "@/components/Field";
import { Button } from "@/components/ui/button";

const FACES = ["😠", "🙁", "😐", "🙂", "😄"];

function Pills<T extends string>({ opts, value, onChange }: { opts: [T, string][]; value: T | ""; onChange: (v: T) => void }) {
  return <div className="flex flex-wrap gap-2">{opts.map(([v, l]) => (
    <Button key={v} type="button" variant="outline" aria-pressed={value === v} onClick={() => onChange(v)} className={`min-h-12 h-auto max-w-full whitespace-normal rounded-xl border-2 px-4 py-3 text-left font-semibold ${value === v ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{l}</Button>
  ))}</div>;
}

export function OpinionForm() {
  const [f, setF] = useState({ zona: "", sinAyuda: "", sat: 0, usaria: "", serv: "", precio: "", comentario: "", whatsapp: "" });
  const [attempted, setAttempted] = useState(false);
  const errors = attempted ? fieldErrors(opinionSchema, f) : {};
  const error = (key: string) => errors[key] ? <p role="alert" className="text-xs text-destructive">{errors[key]}</p> : null;
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const up = (p: Partial<typeof f>) => setF({ ...f, ...p });

  if (done) return <Card className="text-center"><CheckCircle2 className="mx-auto h-12 w-12 text-success" /><p className="mt-2 text-xl font-bold">¡Gracias, casero!</p><p className="text-muted-foreground">Tu opinión nos ayuda a mejorar.</p></Card>;

  const send = async () => {
    setAttempted(true);
    if (!opinionSchema.safeParse(f).success) return;
    setSending(true);
    try {
      await submitOpinion({ zona: f.zona, armo_sin_ayuda: f.sinAyuda === "si", satisfaccion: f.sat, lo_usaria: f.usaria, servicio_preferido: f.serv, precio_justo: f.precio.trim(), comentario: f.comentario.trim().slice(0, 600), whatsapp: f.whatsapp.replace(/\s/g, "") });
      setDone(true); toast.success("Opinión enviada");
    } catch { toast.error("No se pudo enviar. Inténtalo otra vez."); } finally { setSending(false); }
  };

  return (
    <Card className="space-y-5">
      <h2 className="text-2xl font-bold">Danos tu opinión</h2>
      <div className="space-y-2"><p className="font-semibold">¿Dónde está tu negocio? *</p><Pills opts={OP_ZONES.map((z) => [z, z] as [string, string])} value={f.zona} onChange={(zona) => up({ zona })} />{error("zona")}</div>
      <div className="space-y-2"><p className="font-semibold">¿Armaste tu pedido sin ayuda? *</p><Pills opts={[["si", "Sí"], ["no", "No"]]} value={f.sinAyuda} onChange={(sinAyuda) => up({ sinAyuda })} />{error("sinAyuda")}</div>
      <div className="space-y-2"><p className="font-semibold">¿Qué tan contento estás? *</p>
        <div className="flex gap-2">{FACES.map((e, i) => <button key={i} type="button" aria-label={`${i + 1} de 5`} onClick={() => up({ sat: i + 1 })} className={`h-14 flex-1 rounded-xl border-2 text-3xl ${f.sat === i + 1 ? "border-primary bg-secondary" : "bg-card"}`}>{e}</button>)}</div>{error("sat")}</div>
      <div className="space-y-2"><p className="font-semibold">¿Lo usarías? *</p><Pills opts={Object.entries(OP_USARIA) as [string, string][]} value={f.usaria} onChange={(usaria) => up({ usaria })} />{error("usaria")}</div>
      <div className="space-y-2"><p className="text-lg font-semibold">¿Qué tipo de entrega prefieres? *</p><div className="grid gap-3">{Object.entries(OP_SERVICES).map(([value, label]) => <Button key={value} type="button" variant="outline" aria-pressed={f.serv === value} onClick={() => up({ serv: value })} className={`h-auto min-h-16 w-full justify-start whitespace-normal rounded-xl border-2 px-4 py-4 text-left text-lg ${f.serv === value ? "border-primary bg-primary text-primary-foreground" : "bg-card"}`}>{label}</Button>)}</div>{error("serv")}</div>
      <label className="block space-y-1"><span className="font-semibold">¿Cuánto sería un precio justo?</span><input className={inputCls} maxLength={50} value={f.precio} onChange={(e) => up({ precio: e.target.value })} placeholder="Escribe un monto en soles" />{error("precio")}</label>
      <label className="block space-y-1"><span className="font-semibold">Comentario (opcional)</span><textarea className={`${inputCls} h-20 py-2`} maxLength={600} value={f.comentario} onChange={(e) => up({ comentario: e.target.value })} />{error("comentario")}</label>
      <label className="block space-y-1"><span className="font-semibold">WhatsApp (opcional)</span><span className="block text-xs text-muted-foreground">Si quieres hacer una compra real</span><input className={inputCls} inputMode="numeric" maxLength={9} value={f.whatsapp} onChange={(e) => up({ whatsapp: digits(e.target.value) })} placeholder="9XXXXXXXX" />{error("whatsapp")}</label>
      <Button onClick={send} disabled={sending || Object.keys(errors).length > 0} className="h-14 w-full rounded-xl bg-primary text-lg font-bold text-primary-foreground disabled:opacity-60">{sending ? "Enviando..." : "Enviar opinión"}</Button>
    </Card>
  );
}
