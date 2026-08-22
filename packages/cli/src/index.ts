import { Command } from "commander";
import { render } from "./commands/render";
import { doctor } from "./commands/doctor";
import { setup } from "./commands/setup";

// Injected by esbuild's define at build time
declare const SITECAST_VERSION: string;

const program = new Command();

program
  .name("sitecast")
  .description("Record websites as MP4 videos on your local machine")
  .version(SITECAST_VERSION, "-V, --version");

// Add commands
program
  .addCommand(render)
  .addCommand(doctor)
  .addCommand(setup)

program.parseAsync(process.argv).catch((err: unknown) => {
  process.stderr.write(
    "Unexpected error: " +
      (err instanceof Error ? err.message : String(err)) +
      "\n"
  );
  process.exit(1);
});
