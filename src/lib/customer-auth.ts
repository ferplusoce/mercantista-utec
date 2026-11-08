export const normalizePhone = (value: string) => value.replace(/\D/g, "");
export const isValidPhone = (value: string) => /^9\d{8}$/.test(normalizePhone(value));
export const isValidPassword = (value: string) => value.length >= 6;
export const customerEmail = (value: string) => `${normalizePhone(value)}@clientes.mercantista.pe`;
export const safeReturnPath = (value?: string) => value?.startsWith("/") && !value.startsWith("//") ? value : "/mis-pedidos";

type AuthFailure = { code?: string; message?: string; status?: number; name?: string };
export function authFailureReason(cause: unknown) {
  const error: AuthFailure = typeof cause === "object" && cause !== null ? cause : {};
  const code = error.code ?? "";
  const message = error.message ?? "";
  if (code === "weak_password" || /known to be weak|easy to guess|pwned|leaked|compromised/i.test(message)) return "weak_password";
  if (["user_already_exists", "email_exists"].includes(code) || /already registered|already been registered|already exists/i.test(message)) return "account_exists";
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return "invalid_credentials";
  if (code === "signup_disabled" || /signups? (?:are |is )?(?:not allowed|disabled)/i.test(message)) return "signup_disabled";
  if (code === "email_provider_disabled" || /email logins? (?:are |is )?disabled/i.test(message)) return "provider_disabled";
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return "not_confirmed";
  if (code === "activation_required") return "activation_required";
  if (error.status === 429 || /rate.limit|too many requests|security purposes.*seconds/i.test(message)) return "rate_limit";
  if (code === "validation_failed" && /password/i.test(message) || /password.*at least|password.*minimum/i.test(message)) return "short_password";
  if (error.status === 0 || error.name === "AuthRetryableFetchError" || /failed to fetch|network|load failed|timeout/i.test(message)) return "connection";
  if (code === "unexpected_failure" || (error.status ?? 0) >= 500 || /database error/i.test(message)) return "service_error";
  return "unknown";
}

const authMessages: Record<ReturnType<typeof authFailureReason>, string> = {
  weak_password: "La contraseña es muy común o fue filtrada, elige otra",
  account_exists: "Ese celular ya tiene cuenta, inicia sesión",
  invalid_credentials: "Celular o contraseña incorrectos",
  signup_disabled: "El registro está desactivado",
  provider_disabled: "El acceso con celular y contraseña está desactivado",
  not_confirmed: "La cuenta todavía no está activada",
  activation_required: "El registro requiere confirmar la cuenta; no pudimos activar el acceso inmediato",
  rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo otra vez",
  short_password: "La contraseña debe tener mínimo 6 caracteres",
  connection: "No pudimos conectar. Revisa tu conexión e inténtalo otra vez",
  service_error: "El servicio no pudo procesar tu cuenta. Inténtalo más tarde",
  unknown: "Ocurrió un error de acceso no identificado. Inténtalo otra vez",
};
export const authMessage = (cause: unknown) => authMessages[authFailureReason(cause)];
