import { useState } from "react";
import { toast } from "sonner";
import { Camera, Save } from "lucide-react";
import { FORMATS, type Product, type Vendor } from "@/lib/data";
import { categoryFormSchema, productFormSchema, vendorFormSchema, type ProductForm, type VendorForm } from "@/lib/admin";
import { patchCategory, saveProduct, saveVendor, uploadImage, useCatalog } from "@/lib/catalog";
import { digits, fieldErrors, photoSchema } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, inputCls } from "./Field";
import { Photo } from "./ProductCard";

export function AdminImageUpload({ kind, id, src, name }: { kind: "products" | "categories"; id: string; src: string | null; name: string }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  return <div className="space-y-1"><label className="flex cursor-pointer items-center gap-2" title={`Cambiar foto de ${name}`}><Photo src={src} name={name} className="h-14 w-14 shrink-0 text-[10px]" /><Camera className="h-4 w-4" /><input aria-label={`Foto de ${name}`} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="hidden" onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; const r = photoSchema.safeParse(f); if (!r.success) { setError(r.error.issues[0]?.message ?? "Foto inválida"); return; } setError(""); setBusy(true); try { if (!await uploadImage(kind, id, f)) throw new Error(); toast.success("Foto guardada"); } catch { setError("No se pudo subir la foto"); } finally { setBusy(false); e.target.value = ""; } }} /></label>{busy && <p className="text-xs text-muted-foreground">Subiendo...</p>}{error && <p role="alert" className="text-xs text-destructive">{error}</p>}</div>;
}

export function ProductEditor({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { categories, vendors } = useCatalog();
  const [f, setF] = useState<ProductForm>(product ?? { name: "", category: "", vendorId: "", unit: "", format: "Saco", weightKg: 0, price: 0, quality: "Primera", availability: "por_confirmar", desc: "", active: true });
  const [checked, setChecked] = useState(false), [busy, setBusy] = useState(false), [file, setFile] = useState<File | null>(null), [fileError, setFileError] = useState("");
  const errors = checked ? fieldErrors(productFormSchema, f) : {};
  const change = (key: keyof ProductForm, value: string | number | boolean) => setF({ ...f, [key]: value });
  const save = async () => { setChecked(true); if (!productFormSchema.safeParse(f).success || fileError) return; setBusy(true); try { const id = await saveProduct(f, product?.id); if (file && !await uploadImage("products", id, file)) { toast.error("Producto guardado, pero no se pudo subir la foto"); return; } toast.success("Producto guardado"); onClose(); } catch { toast.error("No se pudo guardar el producto"); } finally { setBusy(false); } };
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-2xl"><DialogHeader><DialogTitle>{product ? "Editar producto" : "Nuevo producto"}</DialogTitle></DialogHeader><div className="grid gap-4 sm:grid-cols-2">
    <Field label="Producto" required error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => change("name", e.target.value)} /></Field>
    <Field label="Presentación" required error={errors.unit}><input className={inputCls} placeholder="Saco de 50 kg" value={f.unit} onChange={(e) => change("unit", e.target.value)} /></Field>
    <Field label="Categoría" required error={errors.category}><select className={inputCls} value={f.category} onChange={(e) => change("category", e.target.value)}><option value="">Elige una categoría</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></Field>
    <Field label="Puesto" required error={errors.vendorId}><select className={inputCls} value={f.vendorId} onChange={(e) => change("vendorId", e.target.value)}><option value="">Elige un puesto</option>{vendors.map((v) => <option key={v.id} value={v.id}>{v.stall} · {v.name}</option>)}</select></Field>
    <Field label="Formato" error={errors.format}><select className={inputCls} value={f.format} onChange={(e) => change("format", e.target.value)}>{FORMATS.map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="Peso kg" required error={errors.weightKg}><input className={inputCls} type="number" step="0.1" value={f.weightKg || ""} onChange={(e) => change("weightKg", Number(e.target.value))} /></Field>
    <Field label="Precio S/" required error={errors.price}><input className={inputCls} type="number" step="0.01" value={f.price || ""} onChange={(e) => change("price", Number(e.target.value))} /></Field>
    <Field label="Calidad" error={errors.quality}><select className={inputCls} value={f.quality} onChange={(e) => change("quality", e.target.value)}>{["Primera", "Segunda", "Comercial"].map((v) => <option key={v}>{v}</option>)}</select></Field>
    <Field label="Disponibilidad" error={errors.availability}><select className={inputCls} value={f.availability} onChange={(e) => change("availability", e.target.value)}><option value="disponible">Disponible</option><option value="por_confirmar">Por confirmar</option><option value="agotado">Agotado</option></select></Field>
    <Field label="Foto" error={fileError}><input aria-label="Foto del producto" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { const x = e.target.files?.[0]; if (!x) return; const r = photoSchema.safeParse(x); setFileError(r.success ? "" : r.error.issues[0]?.message ?? "Foto inválida"); setFile(r.success ? x : null); }} /></Field>
    <div className="sm:col-span-2"><Field label="Descripción" error={errors.desc}><textarea className={`${inputCls} h-20 py-2`} value={f.desc} onChange={(e) => change("desc", e.target.value)} /></Field></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.active} onChange={(e) => change("active", e.target.checked)} />Activo</label>
  </div><Button disabled={busy || !!fileError || Object.keys(errors).length > 0} onClick={save}><Save />{busy ? "Guardando..." : "Guardar producto"}</Button></DialogContent></Dialog>;
}

export function VendorEditor({ vendor, onClose }: { vendor: Vendor | null; onClose: () => void }) {
  const [f, setF] = useState<VendorForm>(vendor ?? { name: "", stall: "", pavilion: "", contact: "", phone: "", specialty: "", schedule: "", active: true });
  const [checked, setChecked] = useState(false), [busy, setBusy] = useState(false);
  const errors = checked ? fieldErrors(vendorFormSchema, f) : {};
  return <Dialog open onOpenChange={(open) => !open && onClose()}><DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{vendor ? "Editar casero" : "Nuevo casero"}</DialogTitle></DialogHeader><div className="grid gap-3 sm:grid-cols-2">{([['name','Nombre'],['stall','Número de puesto'],['pavilion','Pabellón'],['contact','Responsable'],['phone','Celular'],['specialty','Especialidad'],['schedule','Horario']] as const).map(([k,label]) => <Field key={k} label={label} required={['name','stall','pavilion'].includes(k)} error={errors[k]}><input className={inputCls} value={f[k]} inputMode={k === "phone" ? "numeric" : "text"} maxLength={k === "phone" ? 9 : 200} onChange={(e) => setF({ ...f, [k]: k === "phone" ? digits(e.target.value) : e.target.value })} /></Field>)}</div><Button disabled={busy || Object.keys(errors).length > 0} onClick={async () => { setChecked(true); if (!vendorFormSchema.safeParse(f).success) return; setBusy(true); try { await saveVendor(f, vendor?.id); toast.success("Casero guardado"); onClose(); } catch { toast.error("No se pudo guardar el casero"); } finally { setBusy(false); } }}><Save />{busy ? "Guardando..." : "Guardar casero"}</Button></DialogContent></Dialog>;
}

export function AdminCategories() {
  const { categories } = useCatalog();
  return <section><h2 className="mb-4 text-xl font-bold">Categorías</h2>{!categories.length && <p className="text-muted-foreground">Aún no hay datos</p>}<div className="divide-y">{categories.map((c) => <CategoryRow key={c.id} category={c} />)}</div></section>;
}
function CategoryRow({ category: c }: { category: ReturnType<typeof useCatalog>["categories"][number] }) {
  const [f, setF] = useState({ name: c.name, sortOrder: c.sortOrder }), [checked, setChecked] = useState(false), [busy, setBusy] = useState(false);
  const errors = checked ? fieldErrors(categoryFormSchema, f) : {};
  return <div className="grid items-start gap-4 py-4 sm:grid-cols-[auto_1fr_110px_auto]"><AdminImageUpload kind="categories" id={c.id} src={c.image} name={c.name} /><Field label="Nombre" error={errors.name}><input className={inputCls} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field><Field label="Orden" error={errors.sortOrder}><input className={inputCls} type="number" value={f.sortOrder} onChange={(e) => setF({ ...f, sortOrder: Number(e.target.value) })} /></Field><Button className="sm:mt-6" variant="outline" disabled={busy || Object.keys(errors).length > 0} onClick={async () => { setChecked(true); if (!categoryFormSchema.safeParse(f).success) return; setBusy(true); try { await patchCategory(c.id, f); toast.success("Categoría guardada"); } catch { toast.error("No se pudo guardar"); } finally { setBusy(false); } }}><Save />Guardar</Button></div>;
}