import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const retireOperator = createServerFn({ method: "POST" }).middleware([requireSupabaseAuth]).handler(async ({ context }) => {
  const { data: allowed, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
  if (error || !allowed) throw new Error("No autorizado");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const id = "c812290e-46ff-408a-8c59-b9f0f739b5ba";
  const { data } = await supabaseAdmin.auth.admin.getUserById(id);
  if (data.user?.email !== "operador@mercantista.app") throw new Error("Cuenta no válida");
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(id);
  if (deleteError) throw new Error("No se pudo retirar el operador");
  return { retired: true };
});