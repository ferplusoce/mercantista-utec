import { useEffect, useRef, useState } from "react";
import { Images, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { refreshCatalog, uploadImage, useCatalog } from "@/lib/catalog";
import { matchPhotoId, photoTypeLabel, type PhotoType } from "@/lib/catalog-photos";
import { photoSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { inputCls } from "./Field";

type Entry = { key: string; file: File; preview: string; id: string; error: string; status: "pending" | "uploading" | "done" | "failed" };
export function BatchPhotoUpload({ kind }: { kind: "products" | "categories" }) {
  const catalog = useCatalog();
  const targets = catalog[kind];
  const input = useRef<HTMLInputElement>(null);
  const urls = useRef<string[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [type, setType] = useState<PhotoType>("puesto");
  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const clear = () => { urls.current.forEach((url) => URL.revokeObjectURL(url)); urls.current = []; setEntries([]); };
  const duplicate = (row: Entry) => !!row.id && entries.some((x) => x.key !== row.key && x.id === row.id);
  const invalid = entries.some((row) => row.error || !targets.some((x) => x.id === row.id) || duplicate(row));
  const pending = entries.filter((row) => row.status !== "done");
  const update = (key: string, patch: Partial<Entry>) => setEntries((rows) => rows.map((row) => row.key === key ? { ...row, ...patch } : row));
  const upload = async () => {
    if (invalid || !pending.length) return;
    setBusy(true);
    let saved = 0;
    try {
      for (const row of pending) {
        update(row.key, { status: "uploading" });
        try {
          const ok = await uploadImage(kind, row.id, row.file, kind === "products" ? type : undefined, false);
          update(row.key, { status: ok ? "done" : "failed" });
          if (ok) saved++;
        } catch { update(row.key, { status: "failed" }); }
      }
      await refreshCatalog();
      if (saved === pending.length) toast.success(`${saved} fotos guardadas`);
      else toast.error(`${saved} de ${pending.length} fotos guardadas; reintenta las pendientes`);
    } finally { setBusy(false); }
  };
  return <>
    <Button variant="outline" onClick={() => input.current?.click()}><Images />Subir varias fotos</Button>
    <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp" aria-label={`Varias fotos de ${kind === "products" ? "productos" : "categorías"}`} className="hidden" onChange={(e) => {
      const files = Array.from(e.target.files ?? []);
      if (!files.length) return;
      clear();
      setEntries(files.map((file) => {
        const result = photoSchema.safeParse(file);
        const preview = result.success ? URL.createObjectURL(file) : "";
        if (preview) urls.current.push(preview);
        return { key: crypto.randomUUID(), file, preview, id: matchPhotoId(file.name, targets.map((x) => x.id)), error: result.success ? "" : result.error.issues[0]?.message ?? "Foto inválida", status: "pending" };
      }));
      setOpen(true); e.target.value = "";
    }} />
    <Dialog open={open} onOpenChange={(value) => { if (busy) return; setOpen(value); if (!value) clear(); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-3xl" onEscapeKeyDown={(e) => { if (busy) e.preventDefault(); }}>
        <DialogHeader><DialogTitle>Fotos de {kind === "products" ? "productos" : "categorías"}</DialogTitle></DialogHeader>
        {kind === "products" && <label className="grid gap-1 text-sm">Tipo de foto del lote<select aria-label="Tipo de foto del lote" className={inputCls} disabled={busy || entries.some((row) => row.status === "done")} value={type} onChange={(e) => setType(e.target.value as PhotoType)}>{(["puesto", "referencial"] as const).map((v) => <option key={v} value={v}>{photoTypeLabel(v)}</option>)}</select></label>}
        <div className="divide-y">{entries.map((row) => <div key={row.key} className="grid grid-cols-[64px_minmax(0,1fr)_44px] items-start gap-3 py-3">
          {row.preview ? <img src={row.preview} alt={row.file.name} className="h-16 w-16 rounded-md bg-muted object-cover" /> : <div className="h-16 w-16 rounded-md bg-muted" />}
          <div className="min-w-0 space-y-1"><p className="break-all text-sm font-medium">{row.file.name}</p><select aria-label={`Asignar ${row.file.name}`} className={inputCls} disabled={busy || row.status === "done"} value={row.id} onChange={(e) => update(row.key, { id: e.target.value, status: "pending" })}><option value="">Elige {kind === "products" ? "producto" : "categoría"}</option>{targets.map((x) => <option key={x.id} value={x.id}>{x.name} · {x.id}</option>)}</select>
            {(row.error || !row.id || duplicate(row) || row.status === "failed") && <p role="alert" className="text-xs text-destructive">{row.error || (duplicate(row) ? "Hay dos fotos para la misma asignación" : !row.id ? "Selecciona una asignación" : "No se pudo subir; reintenta")}</p>}
            {row.status === "done" && <p className="text-xs text-success">Foto guardada</p>}{row.status === "uploading" && <p role="status" className="text-xs text-muted-foreground">Subiendo...</p>}
          </div>
          <Button size="icon" variant="ghost" aria-label={`Quitar ${row.file.name}`} disabled={busy} onClick={() => { URL.revokeObjectURL(row.preview); urls.current = urls.current.filter((url) => url !== row.preview); setEntries((rows) => rows.filter((x) => x.key !== row.key)); }}><X /></Button>
        </div>)}</div>
        <Button disabled={busy || invalid || !pending.length} onClick={() => void upload()}><Upload />{busy ? "Subiendo..." : `Subir ${pending.length} fotos`}</Button>
      </DialogContent>
    </Dialog>
  </>;
}