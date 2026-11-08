import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./validation";

describe("password rules on screen", () => {
  it("registration requires at least 8 characters", () => {
    const r = registerSchema.safeParse({ phone: "987654321", password: "bodega2" });
    expect(r.success).toBe(false);
    expect(!r.success && r.error.issues[0].message).toBe("Usa al menos 8 caracteres");
  });
  it("registration accepts lowercase letters and numbers only", () => {
    expect(registerSchema.safeParse({ phone: "987654321", password: "bodega2026" }).success).toBe(true);
  });
  it("login still accepts older short passwords", () => {
    expect(loginSchema.safeParse({ phone: "987654321", password: "123456" }).success).toBe(true);
  });
});
