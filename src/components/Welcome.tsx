import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HowItWorks, WELCOME_TEXT } from "./HowItWorks";

function WelcomeDialogBody({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const start = () => { localStorage.setItem("mct_welcome_seen", "1"); onOpenChange(false); };
  return (
    <Dialog open={open} onOpenChange={(value) => { if (!value) start(); else onOpenChange(true); }}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-2xl" aria-describedby="welcome-description">
        <DialogHeader><DialogTitle className="text-3xl">Mercantista</DialogTitle><DialogDescription id="welcome-description" className="mt-3 text-left text-lg leading-relaxed">{WELCOME_TEXT}</DialogDescription></DialogHeader>
        <HowItWorks compact />
        <Button className="h-14 w-full text-xl font-bold" onClick={start}>Empezar</Button>
      </DialogContent>
    </Dialog>
  );
}

/** Ventana de bienvenida: se abre sola la primera vez (mct_welcome_seen != "1"). */
export function WelcomeDialog() {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(localStorage.getItem("mct_welcome_seen") !== "1"); }, []);
  return <WelcomeDialogBody open={open} onOpenChange={setOpen} />;
}

/** Botón "Ver cómo funciona la app" (solo en /cuenta): abre la misma ventana. */
export function Welcome() {
  const [open, setOpen] = useState(false);
  return <>
    <Button variant="outline" onClick={() => setOpen(true)} className="h-11 text-sm"><RotateCcw className="h-4 w-4" />Ver cómo funciona la app</Button>
    <WelcomeDialogBody open={open} onOpenChange={setOpen} />
  </>;
}
