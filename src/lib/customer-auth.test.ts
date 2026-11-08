import { describe, expect, it } from "vitest";
import { authFailureReason, authMessage, customerEmail, isValidPassword, isValidPhone, normalizePhone, safeReturnPath } from "./customer-auth";

describe("customer credentials", () => {
  it("accepts only a 9-digit mobile number beginning with 9", () => {
    expect(isValidPhone("987654321")).toBe(true);
    expect(isValidPhone("887654321")).toBe(false);
    expect(isValidPhone("98765432")).toBe(false);
    expect(isValidPhone("9876543210")).toBe(false);
  });
  it("normalizes a formatted mobile number", () => {
    expect(normalizePhone("987 654 321")).toBe("987654321");
  });
  it("requires a password of at least 8 characters with no character rules", () => {
    expect(isValidPassword("1234567")).toBe(false);
    expect(isValidPassword("bodega26")).toBe(true);
  });
  it("uses the requested internal customer email", () => {
    expect(customerEmail("987654321")).toBe("987654321@clientes.mercantista.pe");
  });
  it("returns signed-in customers to a local page only", () => {
    expect(safeReturnPath("/checkout")).toBe("/checkout");
    expect(safeReturnPath("https://example.com")).toBe("/mis-pedidos");
    expect(safeReturnPath("//example.com")).toBe("/mis-pedidos");
  });
});

describe("authentication failure classification", () => {
  it.each([
    ["user_already_exists", "account_exists"],
    ["email_exists", "account_exists"],
    ["invalid_credentials", "invalid_credentials"],
    ["signup_disabled", "signup_disabled"],
    ["email_provider_disabled", "provider_disabled"],
    ["email_not_confirmed", "not_confirmed"],
    ["activation_required", "activation_required"],
  ])("classifies %s independently of English wording", (code, reason) => {
    expect(authFailureReason({ code })).toBe(reason);
  });
  it("maps weak_password reasons to separate messages", () => {
    expect(authMessage({ code: "weak_password", reasons: ["length"] })).toBe("Usa al menos 8 caracteres");
    expect(authMessage({ code: "weak_password", reasons: ["pwned"] })).toBe("Esa contraseña es muy conocida, elige otra");
    expect(authMessage({ code: "user_already_exists" })).toBe("Ese celular ya tiene cuenta, inicia sesión");
    expect(authMessage({ code: "invalid_credentials" })).toBe("Celular o contraseña incorrectos");
  });
  it("recognizes the logged pwned rejection without a code", () => {
    expect(authFailureReason(new Error("Password is known to be weak and easy to guess, please choose a different one."))).toBe("password_pwned");
  });
  it("distinguishes network failure from invalid input", () => {
    expect(authFailureReason(new TypeError("Failed to fetch"))).toBe("connection");
    expect(authFailureReason({ status: 429 })).toBe("rate_limit");
    expect(authFailureReason({ status: 500 })).toBe("service_error");
    expect(authFailureReason(null)).toBe("unknown");
  });
});
