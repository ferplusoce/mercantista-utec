import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { LogOut, PackageSearch, Trash2 } from "lucide-react";
import { ZONES } from "@/lib/data";
import { useAccount, useAccountActions, type AccountProfile } from "@/lib/account";
import { useAuth } from "@/lib/auth";
import { Card, Field, inputCls } from "@/components/Field";
import { profileSchema, accountAddressSchema, taxiSchema, fieldErrors, formatPlate, digits } from "@/lib/validation";
import { Button } from "@/components/ui/button";
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
  const [checked, setChecked] = useState({ profile: false, address: false, taxi: false });
  const pe = checked.profile ? fieldErrors(profileSchema, profile) : {};
  const ae = checked.address ? fieldErrors(accountAddressSchema, addr) : {};
  const te = checked.taxi ? fieldErrors(taxiSchema, taxi) : {};

  useEffect(() => { if (account.data) setProfile(account.data.profile); }, [account.data]);

  const saveProfile = async () => {
    setChecked({ ...checked, profile: true });
    if (!profileSchema.safeParse(profile).success) return;
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
            <Field error={pe.business} label="Bodega / negocio" required><input className={inputCls} value={profile.business} onChange={(e) => setProfile({ ...profile, business: e.target.value })} /></Field>
            <Field error={pe.owner} label="Dueño / responsable" required><input className={inputCls} value={profile.owner} onChange={(e) => setProfile({ ...profile, owner: e.target.value })} /></Field>
            <Field error={pe.phone} label="Celular de acceso"><input className={inputCls} value={profile.phone} readOnly aria-readonly="true" /></Field>
            <div className="grid grid-cols-3 gap-2">
              <Field error={pe.docType} label="Documento"><select className={inputCls} value={profile.docType} onChange={(e) => setProfile({ ...profile, docType: e.target.value })}><option>DNI</option><option>RUC</option></select></Field>
              <div className="col-span-2"><Field error={pe.docNumber} label="Número"><input className={inputCls} inputMode="numeric" maxLength={profile.docType === "RUC" ? 11 : 8} value={profile.docNumber} onChange={(e) => setProfile({ ...profile, docNumber: digits(e.target.value) })} /></Field></div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Usarás este celular y tu contraseña para iniciar sesión.</p>
          <Button onClick={saveProfile} disabled={saving || Object.keys(pe).length > 0} className="h-11 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-60">{saving ? "Guardando..." : "Guardar datos"}</Button>
        </Card>
        <div className="grid gap-5 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="font-bold">Direcciones de entrega</h2>
            {account.data?.addresses.map((a) => <div key={a.id} className="flex justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><div><p className="font-semibold">{a.line}</p><p className="text-muted-foreground">{a.zone}{a.ref && ` · ${a.ref}`}</p></div><button aria-label={`Eliminar dirección ${a.line}`} onClick={() => void actions.deleteAddress(a.id).catch(() => toast.error("No se pudo eliminar"))}><Trash2 className="h-4 w-4" /></button></div>)}
            <Field label="Zona" error={ae.zone} required><select aria-label="Zona de la nueva dirección" className={inputCls} value={addr.zone} onChange={(e) => setAddr({ ...addr, zone: e.target.value })}>{ZONES.map((z) => <option key={z}>{z}</option>)}</select></Field>
            <Field label="Dirección" error={ae.line} required><input className={inputCls} aria-label="Nueva dirección" placeholder="Dirección" maxLength={120} value={addr.line} onChange={(e) => setAddr({ ...addr, line: e.target.value })} /></Field>
            <Field label="Referencia" error={ae.ref} required><input className={inputCls} aria-label="Referencia de la nueva dirección" placeholder="Referencia (portón, color, esquina)" maxLength={120} value={addr.ref} onChange={(e) => setAddr({ ...addr, ref: e.target.value })} /></Field>
            <Button variant="outline" disabled={Object.keys(ae).length > 0} className="h-11 w-full" onClick={() => { setChecked({ ...checked, address: true }); if (!accountAddressSchema.safeParse(addr).success) return; void actions.addAddress(addr).then(() => { setAddr({ ...addr, line: "", ref: "" }); setChecked({ ...checked, address: false }); toast.success("Dirección guardada"); }).catch(() => toast.error("No se pudo guardar la dirección")); }}>Guardar dirección</Button>
          </Card>
          <Card className="space-y-3">
            <h2 className="font-bold">Mis taxis de confianza</h2>
            {account.data?.taxis.map((t) => <div key={t.id} className="flex justify-between gap-3 rounded-xl bg-muted p-3 text-sm"><span>{t.driver} · {t.plate}{t.phone && ` · ${t.phone}`}</span><button aria-label={`Eliminar taxi ${t.plate}`} onClick={() => void actions.deleteTaxi(t.id).catch(() => toast.error("No se pudo eliminar"))}><Trash2 className="h-4 w-4" /></button></div>)}
            <Field label="Nombre del chofer" error={te.driver} required><input className={inputCls} aria-label="Nombre del chofer" placeholder="Nombre del chofer" maxLength={200} value={taxi.driver} onChange={(e) => setTaxi({ ...taxi, driver: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-2"><Field label="Placa del taxi" error={te.plate} required><input className={inputCls} aria-label="Placa del taxi" placeholder="Placa" maxLength={7} value={taxi.plate} onChange={(e) => setTaxi({ ...taxi, plate: formatPlate(e.target.value) })} /></Field><Field label="Celular del chofer" error={te.phone} required><input className={inputCls} aria-label="Celular del chofer" placeholder="Celular" inputMode="numeric" maxLength={9} value={taxi.phone} onChange={(e) => setTaxi({ ...taxi, phone: e.target.value.replace(/\D/g, "") })} /></Field></div>
            <Button variant="outline" disabled={Object.keys(te).length > 0} className="h-11 w-full" onClick={() => { setChecked({ ...checked, taxi: true }); if (!taxiSchema.safeParse(taxi).success) return; void actions.addTaxi(taxi).then(() => { setTaxi({ driver: "", plate: "", phone: "" }); setChecked({ ...checked, taxi: false }); toast.success("Taxi guardado"); }).catch(() => toast.error("No se pudo guardar el taxi")); }}>Guardar taxi</Button>
          </Card>
        </div>
      </>}
      <Link to="/mis-pedidos" className="flex items-center justify-center gap-2 rounded-2xl border bg-card p-5 font-semibold text-primary"><PackageSearch className="h-5 w-5" />Ver mis pedidos</Link>
    </div>
  );
}
