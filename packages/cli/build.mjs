// Build script for packages/cli.
//
// Uses esbuild to bundle the CLI and all workspace dependencies into a single
// Node.js CommonJS file. Playwright is left external because it loads native
// binaries at runtime and cannot be bundled.

import { build } from "esbuild";
import { writeFileSync, readFileSync, chmodSync } from "fs";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

const result = await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node18",
  format: "cjs",
  outfile: "dist/index.js",
  // Playwright loads native binaries from its own node_modules directory at
  // runtime. Bundling it would break those relative path lookups.
  external: ["playwright"],
  // Inject the package version into the bundle so --version works without
  // a package.json read at runtime.
  define: {
    SITECAST_VERSION: JSON.stringify(pkg.version),
  },
  metafile: true,
  logLevel: "info",
});

// Prepend the Node.js shebang so the file can be run directly.
const dist = readFileSync("dist/index.js", "utf8");
writeFileSync("dist/index.js", "#!/usr/bin/env node\n" + dist);
chmodSync("dist/index.js", 0o755);

const outputs = Object.keys(result.metafile.outputs);
console.log("Built:", outputs.join(", "));
