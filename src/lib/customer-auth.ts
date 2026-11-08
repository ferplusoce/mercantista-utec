export const PASSWORD_MIN_LENGTH = 8;
export const normalizePhone = (value: string) => value.replace(/\D/g, "");
export const isValidPhone = (value: string) => /^9\d{8}$/.test(normalizePhone(value));
export const isValidPassword = (value: string) => value.length >= PASSWORD_MIN_LENGTH;
export const customerEmail = (value: string) => `${normalizePhone(value)}@clientes.mercantista.pe`;
export const safeReturnPath = (value?: string) => value?.startsWith("/") && !value.startsWith("//") ? value : "/mis-pedidos";

type AuthFailure = { code?: string; message?: string; status?: number; name?: string; reasons?: string[]; weak_password?: { reasons?: string[] } };
export type AuthFailureReason =
  | "password_too_short" | "password_pwned" | "password_characters" | "account_exists" | "invalid_credentials"
  | "signup_disabled" | "provider_disabled" | "not_confirmed" | "activation_required" | "rate_limit"
  | "connection" | "service_error" | "unknown";

/** Returns every distinct cause reported by the auth provider (weak_password can carry several reasons). */
export function authFailureReasons(cause: unknown): AuthFailureReason[] {
  const error: AuthFailure = typeof cause === "object" && cause !== null ? cause : {};
  const code = error.code ?? "";
  const message = error.message ?? "";
  const reasons = error.reasons ?? error.weak_password?.reasons ?? [];
  if (code === "weak_password" || reasons.length > 0) {
    const out: AuthFailureReason[] = [];
    if (reasons.includes("length") || /at least \d+ characters/i.test(message)) out.push("password_too_short");
    if (reasons.includes("pwned") || /known to be weak|easy to guess|pwned|leaked/i.test(message)) out.push("password_pwned");
    if (reasons.includes("characters") || /should contain/i.test(message)) out.push("password_characters");
    return out.length ? out : ["unknown"];
  }
  if (/password should be at least|known to be weak|easy to guess/i.test(message)) {
    const out: AuthFailureReason[] = [];
    if (/at least \d+ characters/i.test(message)) out.push("password_too_short");
    if (/known to be weak|easy to guess/i.test(message)) out.push("password_pwned");
    return out;
  }
  if (["user_already_exists", "email_exists"].includes(code) || /already registered|already been registered|already exists/i.test(message)) return ["account_exists"];
  if (code === "invalid_credentials" || /invalid login credentials/i.test(message)) return ["invalid_credentials"];
  if (code === "signup_disabled" || /signups? (?:are |is )?(?:not allowed|disabled)/i.test(message)) return ["signup_disabled"];
  if (code === "email_provider_disabled" || /email logins? (?:are |is )?disabled/i.test(message)) return ["provider_disabled"];
  if (code === "email_not_confirmed" || /email not confirmed/i.test(message)) return ["not_confirmed"];
  if (code === "activation_required") return ["activation_required"];
  if (code === "over_request_rate_limit" || error.status === 429 || /rate.limit|too many requests|security purposes.*seconds/i.test(message)) return ["rate_limit"];
  if (error.status === 0 || error.name === "AuthRetryableFetchError" || /failed to fetch|network|load failed|timeout/i.test(message)) return ["connection"];
  if (code === "unexpected_failure" || (error.status ?? 0) >= 500 || /database error/i.test(message)) return ["service_error"];
  return ["unknown"];
}
export const authFailureReason = (cause: unknown) => authFailureReasons(cause)[0];

const authMessages: Record<AuthFailureReason, string> = {
  password_too_short: `Usa al menos ${PASSWORD_MIN_LENGTH} caracteres`,
  password_pwned: "Esa contraseña es muy conocida, elige otra",
  password_characters: "La contraseña necesita otros tipos de caracteres",
  account_exists: "Ese celular ya tiene cuenta, inicia sesión",
  invalid_credentials: "Celular o contraseña incorrectos",
  signup_disabled: "El registro está desactivado",
  provider_disabled: "El acceso con celular y contraseña está desactivado",
  not_confirmed: "La cuenta todavía no está activada",
  activation_required: "El registro requiere confirmar la cuenta; no pudimos activar el acceso inmediato",
  rate_limit: "Demasiados intentos. Espera unos minutos e inténtalo otra vez",
  connection: "No pudimos conectar. Revisa tu conexión e inténtalo otra vez",
  service_error: "El servicio no pudo procesar tu cuenta. Inténtalo más tarde",
  unknown: "Ocurrió un error de acceso no identificado. Inténtalo otra vez",
};
/** One sentence per distinct cause; different causes are never merged into a generic message. */
export const authMessage = (cause: unknown) => authFailureReasons(cause).map((r) => authMessages[r]).join(". ");
