import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    setIos(/iphone|ipad|ipod/i.test(navigator.userAgent));
    setInstalled(window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);
    const onPrompt = (e: Event) => { e.preventDefault(); setEvt(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (installed) return null;

  const click = async () => {
    if (evt) { await evt.prompt(); await evt.userChoice; setEvt(null); return; }
    setHelp(true);
  };

  return (
    <>
      <button onClick={click} className="inline-flex h-12 items-center justify-center rounded-xl bg-success px-6 font-semibold text-success-foreground"><Download className="mr-2 h-5 w-5" />Instalar app</button>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Instala Mercantista</DialogTitle></DialogHeader>
          {ios ? (
            <ol className="space-y-3 text-base">
              <li>1. Abre esta página en <b>Safari</b>.</li>
              <li className="flex items-center gap-1">2. Toca <b>Compartir</b> <Share className="h-5 w-5 text-primary" /> abajo.</li>
              <li>3. Elige <b>“Agregar a inicio”</b> y toca <b>Agregar</b>.</li>
            </ol>
          ) : (
            <ol className="space-y-3 text-base">
              <li>1. Abre esta página en <b>Chrome</b>.</li>
              <li>2. Toca el menú <b>⋮</b> arriba a la derecha.</li>
              <li>3. Elige <b>“Instalar aplicación”</b> o <b>“Agregar a pantalla principal”</b>.</li>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
