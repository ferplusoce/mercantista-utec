import { createFileRoute } from "@tanstack/react-router";
import { OpinionForm } from "@/components/OpinionForm";

export const Route = createFileRoute("/opinion")({
  head: () => ({ meta: [
    { title: "Danos tu opinión — Mercantista" },
    { name: "description", content: "Cuéntanos qué te pareció Mercantista en un minuto." },
    { property: "og:title", content: "Danos tu opinión — Mercantista" },
    { property: "og:description", content: "Encuesta corta para bodegueros de Lima Sur." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: () => <div className="mx-auto max-w-lg"><OpinionForm /></div>,
});
