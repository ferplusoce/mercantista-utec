import { describe, it, expect } from "vitest";
import { responseMinutes } from "./photos";

describe("tiempo de respuesta a cada foto", () => {
  it("mide minutos entre la subida y la respuesta", () =>
    expect(responseMinutes({ uploaded_at: "2026-10-29T05:00:00Z", responded_at: "2026-10-29T05:07:00Z" })).toBe(7));
  it("sin respuesta aún devuelve null", () => expect(responseMinutes({ uploaded_at: "2026-10-29T05:00:00Z", responded_at: null })).toBeNull());
});
