import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const OPERATOR_EMAIL = "operador@mercantista.app";

/** Verifica la clave del panel (secreto ADMIN_KEY) y devuelve una sesión del operador. */
export const loginWithAdminKey = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ key: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const secret = process.env["ADMIN_KEY"];
    if (!secret) throw new Error("La clave del panel no está configurada");
    if (data.key.length !== secret.length || !timingSafeEqual(data.key, secret)) throw new Error("Clave incorrecta");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    // Asegura que exista el usuario operador, con la clave vigente como contraseña y rol admin.
    const { data: list } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
    let user = list?.users.find((u) => u.email === OPERATOR_EMAIL);
    if (!user) {
      const { data: created, error } = await supabaseAdmin.auth.admin.createUser({ email: OPERATOR_EMAIL, password: secret, email_confirm: true });
      if (error) throw new Error("No se pudo preparar el operador");
      user = created.user!;
    } else {
      await supabaseAdmin.auth.admin.updateUserById(user.id, { password: secret });
    }
    await supabaseAdmin.from("user_roles").upsert({ user_id: user.id, role: "admin" }, { onConflict: "user_id,role", ignoreDuplicates: true });

    const { createClient } = await import("@supabase/supabase-js");
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const pub = createClient(process.env["SUPABASE_URL"]!, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: (input, init) => { const h = new Headers(init?.headers); if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization"); h.set("apikey", key); return fetch(input, { ...init, headers: h }); } },
    });
    const { data: s, error } = await pub.auth.signInWithPassword({ email: OPERATOR_EMAIL, password: secret });
    if (error || !s.session) throw new Error("No se pudo iniciar sesión");
    return { access_token: s.session.access_token, refresh_token: s.session.refresh_token };
  });

function timingSafeEqual(a: string, b: string) {
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
