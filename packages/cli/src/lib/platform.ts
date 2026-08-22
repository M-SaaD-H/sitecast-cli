// Platform utilities.
//
// The renderer requires Linux. Other platforms are caught early so users
// get a clear message rather than a cryptic error from a subprocess.

export type Platform = "linux" | "macos" | "windows" | "other";

export function currentPlatform(): Platform {
  switch (process.platform) {
    case "linux":
      return "linux";
    case "darwin":
      return "macos";
    case "win32":
      return "windows";
    default:
      return "other";
  }
}

export function platformDisplayName(platform: Platform): string {
  switch (platform) {
    case "linux":
      return "Linux";
    case "macos":
      return "macOS";
    case "windows":
      return "Windows";
    default:
      return process.platform;
  }
}

export function isLinux(): boolean {
  return process.platform === "linux";
}
