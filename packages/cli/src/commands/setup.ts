// Usage: sitecast setup
//
// Installs the required pacakges for render in user's os.

import { Command } from "commander";
import { execFileSync } from "child_process";
import { findChromiumExecutable } from "../lib/chromium";
import { status, error } from "../lib/logger";

export const setup = new Command()
  .name("setup")
  .description("Install the Playwright-managed Chromium browser")
  .option("-f, --force", "re-install even if Chromium is already available", false)
  .action(runSetup);

async function runSetup(options: { force?: boolean }): Promise<void> {
  const existing = findChromiumExecutable();

  if (existing && !options.force) {
    status(`Chromium is already available at: ${existing}`);
    status("Run with --force to re-install anyway.");
    return;
  }

  status("Installing Playwright Chromium...");
  status("This will download a Chromium binary to ~/.cache/ms-playwright/");
  status("");

  // Find the playwright CLI. It ships with the playwright package.
  let playwrightCli: string;
  try {
    playwrightCli = require.resolve("playwright/cli");
  } catch {
    error(
      "Could not find the playwright package. Run `npm install -g sitecast` again."
    );
    process.exit(1);
  }

  try {
    execFileSync(process.execPath, [playwrightCli, "install", "chromium"], {
      stdio: "inherit",
    });
  } catch {
    error("Playwright Chromium installation failed.");
    error(
      "Run `sitecast doctor` to see what else might be missing, or try:"
    );
    error("  npx playwright install chromium");
    process.exit(1);
  }

  const after = findChromiumExecutable();
  if (after) {
    status("");
    status(`Chromium installed at: ${after}`);
    status("Run `sitecast doctor` to confirm the environment is ready.");
  } else {
    error("Installation completed but Chromium was not found in the expected location.");
    error("Run `sitecast doctor` for more details.");
    process.exit(1);
  }
}
