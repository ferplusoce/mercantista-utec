import { useEffect, useState, type InputHTMLAttributes } from "react";
import type { z } from "zod";

/** Inline editors keep invalid drafts visible but never send them to Cloud. */
export function ValidatedInput({ value, onCommit, schema, transform, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> & { value: string | number; onCommit: (value: string) => void; schema: z.ZodTypeAny; transform?: (value: string) => string }) {
  const [draft, setDraft] = useState(String(value));
  const [error, setError] = useState("");
  useEffect(() => { setDraft(String(value)); }, [value]);
  return <div className="min-w-0"><input {...props} value={draft} aria-invalid={!!error} onChange={(e) => { const v = transform ? transform(e.target.value) : e.target.value; setDraft(v); const r = schema.safeParse(props.type === "number" ? (v === "" ? NaN : Number(v)) : v); setError(r.success ? "" : r.error.issues[0]?.message ?? "Revisa este campo"); if (r.success) onCommit(v); }} />{error && <p role="alert" className="mt-1 max-w-60 text-xs text-destructive">{error}</p>}</div>;
}