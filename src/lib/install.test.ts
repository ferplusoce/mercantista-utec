import { describe, expect, it } from "vitest";
import { canOfferInstall, installPlatform } from "./install";

describe("installation eligibility", () => {
  it("requires the browser prompt on Android", () => {
    expect(canOfferInstall("android", false, false)).toBe(false);
    expect(canOfferInstall("android", false, true)).toBe(true);
  });
  it("offers Safari instructions on iPhone only", () => {
    expect(installPlatform("Mozilla iPhone Version/18 Mobile Safari/604.1")).toBe("ios");
    expect(installPlatform("Mozilla iPhone CriOS/130 Mobile Safari/604.1")).toBe("unsupported");
    expect(canOfferInstall("ios", false, false)).toBe(true);
  });
  it("never offers installation on desktop or unsupported browsers", () => {
    expect(installPlatform("Mozilla Windows Chrome/130 Safari/537.36")).toBe("unsupported");
    expect(canOfferInstall("unsupported", false, true)).toBe(false);
  });
  it("never offers installation when already installed", () => {
    expect(canOfferInstall("android", true, true)).toBe(false);
    expect(canOfferInstall("ios", true, false)).toBe(false);
  });
});