import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { canOfferInstall, installPlatform, type InstallPlatform } from "@/lib/install";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallButton() {
  const [evt, setEvt] = useState<BIPEvent | null>(null);
  const [platform, setPlatform] = useState<InstallPlatform>("unsupported");
  const [installed, setInstalled] = useState(false);
  const [help, setHelp] = useState(false);

  useEffect(() => {
    const device = installPlatform(navigator.userAgent);
    setPlatform(device);
    const display = window.matchMedia("(display-mode: standalone)");
    const syncInstalled = () => setInstalled(display.matches || (navigator as { standalone?: boolean }).standalone === true);
    syncInstalled();
    display.addEventListener("change", syncInstalled);
    const onPrompt = (e: Event) => { if (device !== "android") return; e.preventDefault(); setEvt(e as BIPEvent); };
    const onInstalled = () => { setInstalled(true); setEvt(null); };
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => { display.removeEventListener("change", syncInstalled); window.removeEventListener("beforeinstallprompt", onPrompt); window.removeEventListener("appinstalled", onInstalled); };
  }, []);

  if (!canOfferInstall(platform, installed, !!evt)) return null;

  const click = async () => {
    if (evt) { const prompt = evt; setEvt(null); try { await prompt.prompt(); await prompt.userChoice; } catch { /* A new browser event is required to offer installation again. */ } return; }
    setHelp(true);
  };

  return (
    <>
      <Button onClick={click} className="h-12 bg-success px-6 text-success-foreground hover:bg-success/90"><Download className="mr-2 h-5 w-5" />Instalar app</Button>
      <Dialog open={help} onOpenChange={setHelp}>
        <DialogContent className="rounded-2xl">
          <DialogHeader><DialogTitle>Instala Mercantista</DialogTitle></DialogHeader>
          {platform === "ios" && (
            <ol className="space-y-3 text-base">
              <li>1. Abre esta página en <b>Safari</b>.</li>
              <li className="flex items-center gap-1">2. Toca <b>Compartir</b> <Share className="h-5 w-5 text-primary" /> abajo.</li>
              <li>3. Elige <b>“Agregar a inicio”</b> y toca <b>Agregar</b>.</li>
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
