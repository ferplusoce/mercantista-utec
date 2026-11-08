import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, PackageSearch, Trash2 } from "lucide-react";
import { ZONES } from "@/lib/data";
import { useAccount, useAccountActions, type AccountProfile } from "@/lib/account";
import { useAuth } from "@/lib/auth";
import { Card, Field, inputCls } from "@/components/Field";
import { Welcome } from "@/components/Welcome";

export const Route = createFileRoute("/_authenticated/cuenta")({
  head: () => ({ meta: [
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { title: "Mi cuenta — Mercantista" },
    { name: "description", content: "Datos privados de tu bodega, direcciones y taxis de confianza." },
    { property: "og:title", content: "Mi cuenta — Mercantista" },
    { property: "og:description", content: "Gestiona tu abastecimiento." },
    { name: "robots", content: "noindex" },
  ] }),
  component: Cuenta,
});

const blank: AccountProfile = { business: "", owner: "", phone: "", docType: "DNI", docNumber: "" };

function Cuenta() {
  const { signOut } = useAuth();
  const account = useAccount();
  const actions = useAccountActions();
  const [profile, setProfile] = useState<AccountProfile>(blank);
  const [taxi, setTaxi] = useState({ driver: "", plate: "", phone: "" });
  const [addr, setAddr] = useState({ zone: ZONES[0] as string, line: "", ref: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { if (account.data) setProfile(account.data.profile); }, [account.data]);

  const saveProfile = async () => {
    if (!profile.business.trim() || !profile.owner.trim()) { toast.error("Completa el nombre de la bodega y del dueño"); return; }
    setSaving(true);
    try { await actions.saveProfile(profile); toast.success("Datos guardados"); }
    catch { toast.error("No se pudieron guardar tus datos"); }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-3xl font-bold">Mi cuenta</h1>
        <div className="flex items-center gap-2"><Welcome /><button onClick={() => void signOut()} className="inline-flex h-10 items-center rounded-xl border px-3 text-sm font-semibold"><LogOut className="mr-1 h-4 w-4" />Salir</button></div>
      </div>
      <p className="text-sm text-muted-foreground">Tus datos se guardan de forma privada en tu cuenta.</p>
      {account.isLoading ? <Card>Cargando tu cuenta...</Card> : account.isError ? <Card className="text-destructive">No pudimos cargar tus datos. Inténtalo otra vez.</Card> : <>
        <Card className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Bodega / negocio" required><input className={inputCls} value={profile.business} onChange={(e) => setProfile({ ...profile, business: e.target.value })} /></Field>
            <Field label="Dueño / responsable" required><input className={inputCls} value={profile.owner} onChange={(e) => setProfile({ ...profile, owner: e.target.value })} /></Field>
            <Field label="Celular de acceso"><input className={inputCls} value={profile.phone} readOnly aria-readonly="true" /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Documento"><select className={inputCls} value={profile.docType} onChange={(e) => setProfile({ ...profile, docType: e.target.value })}><option>DNI</option><option>RUC</option><option>CE</option></select></Field>
              <div className="col-span-2"><Field label="Número"><input className={inputCls} maxLength={20} value={profile.docNumber} onChange={(e) => setProfile({ ...profile, docNumber: e.target.value })} /></Field></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Usarás este celular y tu contraseña para iniciar sesión.</p>
          <button onClick={saveProfile} disabled={saving} className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Guardando..." : "Guardar datos"}</button>
        </Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="font-bold">Direcciones de entrega</h2>
            {account.data?.addresses.map((a) => <div key={a.id} className="flex justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><div><p className="font-semibold">{a.line}</p><p className="text-muted-foreground">{a.zone}{a.ref && ` · ${a.ref}`}</p></div><button aria-label={`Eliminar dirección ${a.line}`} onClick={() => void actions.deleteAddress(a.id).catch(() => toast.error("No se pudo eliminar"))}><Trash2 className="h-4 w-4" /></button></div>)}
            <select aria-label="Zona de la nueva dirección" className={inputCls} value={addr.zone} onChange={(e) => setAddr({ ...addr, zone: e.target.value })}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select>
            <input className={inputCls} aria-label="Nueva dirección" placeholder="Dirección" maxLength={500} value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} />
            <input className={inputCls} aria-label="Referencia de la nueva dirección" placeholder="Referencia (portón, color, esquina)" maxLength={500} value={addr.ref} onChange={(e) => setAddr({ ...addr, ref: e.target.value })} />
            <button className="h-11 w-full rounded-xl border font-semibold" onClick={() => { if (!addr.line.trim()) { toast.error("Ingresa la dirección"); return; } void actions.addAddress({ ...addr, line: addr.line.trim(), ref: addr.ref.trim() }).then(() => { setAddr({ ...addr, line: "", ref: "" }); toast.success("Dirección guardada"); }).catch(() => toast.error("No se pudo guardar la dirección")); }}>Guardar dirección</button>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-bold">Mis taxis de confianza</h2>
            {account.data?.taxis.map((t) => <div key={t.id} className="flex justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><span>{t.driver} · {t.plate}{t.phone && ` · ${t.phone}`}</span><button aria-label={`Eliminar taxi ${t.plate}`} onClick={() => void actions.deleteTaxi(t.id).catch(() => toast.error("No se pudo eliminar"))}><Trash2 className="h-4 w-4" /></button></div>)}
            <input className={inputCls} aria-label="Nombre del chofer" placeholder="Nombre del chofer" maxLength={200} value={taxi.driver} onChange={(e) => setTaxi({ ...taxi, driver: e.target.value })} />
            <div className="grid grid-cols-2 gap-2"><input className={inputCls} aria-label="Placa del taxi" placeholder="Placa" maxLength={20} value={taxi.plate} onChange={(e) => setTaxi({ ...taxi, plate: e.target.value.toUpperCase() })} /><input className={inputCls} aria-label="Celular del chofer" placeholder="Celular" inputMode="numeric" maxLength={9} value={taxi.phone} onChange={(e) => setTaxi({ ...taxi, phone: e.target.value.replace(/\D/g, "") })} /></div>
            <button className="h-11 w-full rounded-xl border font-semibold" onClick={() => { if (!taxi.driver.trim() || !taxi.plate.trim()) { toast.error("Completa chofer y placa"); return; } if (taxi.phone && !/^9\d{8}$/.test(taxi.phone)) { toast.error("Celular del chofer no válido"); return; } void actions.addTaxi({ ...taxi, driver: taxi.driver.trim(), plate: taxi.plate.trim() }).then(() => { setTaxi({ driver: "", plate: "", phone: "" }); toast.success("Taxi guardado"); }).catch(() => toast.error("No se pudo guardar el taxi")); }}>Guardar taxi</button>
          </Card>
        </div>
      </>}
      <Link to="/mis-pedidos" className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-5 font-semibold text-primary"><PackageSearch className="h-5 w-5" />Ver mis pedidos</Link>
    </div>
  );
}
