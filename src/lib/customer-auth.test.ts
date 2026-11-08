import { describe, expect, it } from "vitest";
import { customerEmail, isValidPassword, isValidPhone, normalizePhone, safeReturnPath } from "./customer-auth";

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
  it("requires a password of at least 6 characters", () => {
    expect(isValidPassword("12345")).toBe(false);
    expect(isValidPassword("123456")).toBe(true);
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
