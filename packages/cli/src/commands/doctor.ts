// Usage: sitecast doctor
//
// Checks the local environment and reports whether the renderer can run.
// Exits with code 1 if any required check fails so the command can be used
// in scripts (e.g. CI environment validation).

import { Command } from "commander";
import { runAllChecks } from "../lib/checks";

export const doctor = new Command()
  .name("doctor")
  .description("Check the local environment for rendering requirements")
  .action(runDoctor);

async function runDoctor(): Promise<void> {
  const { checks, allOk } = runAllChecks();

  process.stdout.write("\nSitecast environment\n\n");

  for (const check of checks) {
    const marker = check.ok ? "ok" : "FAIL";
    process.stdout.write(`  [${marker}] ${check.label}\n`);

    if (!check.ok && check.hint) {
      // Indent each line of the hint.
      const indented = check.hint
        .split("\n")
        .map(line => (line ? `"         ${line}` : ""))
        .join("\n");
      process.stdout.write(indented + "\n\n");
    }
  }

  if (allOk) {
    process.stdout.write("\nReady to render.\n\n");
  } else {
    process.stdout.write(
      "\nSome checks failed. Fix the issues above, then run `sitecast doctor` again.\n\n"
    );
    process.exit(1);
  }
}
