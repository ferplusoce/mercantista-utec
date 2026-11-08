export type InstallPlatform = "android" | "ios" | "unsupported";

export function installPlatform(userAgent: string): InstallPlatform {
  if (/Android/i.test(userAgent)) return "android";
  if (/iPhone/i.test(userAgent) && /Safari/i.test(userAgent) && !/CriOS|FxiOS|EdgiOS|OPiOS|DuckDuckGo/i.test(userAgent)) return "ios";
  return "unsupported";
}

export function canOfferInstall(platform: InstallPlatform, installed: boolean, hasPrompt: boolean) {
  return !installed && (platform === "ios" || (platform === "android" && hasPrompt));
}