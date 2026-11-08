export const normalizePhone = (value: string) => value.replace(/\D/g, "");
export const isValidPhone = (value: string) => /^9\d{8}$/.test(normalizePhone(value));
export const isValidPassword = (value: string) => value.length >= 6;
export const customerEmail = (value: string) => `${normalizePhone(value)}@clientes.mercantista.pe`;
export const safeReturnPath = (value?: string) => value?.startsWith("/") && !value.startsWith("//") ? value : "/mis-pedidos";
