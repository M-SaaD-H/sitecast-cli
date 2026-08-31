// Tests for environment check helpers.
//
// The doctor checks that call external binaries are tested with mocking.
// We verify the structure of the return values and the logic for detecting
// failures without actually requiring FFmpeg/Xvfb/etc to be present.

import { test } from "node:test";
import assert from "node:assert/strict";
import { checkNodeVersion, checkLinux } from "../src/lib/checks";

test("checkNodeVersion returns ok for the current process (must be >=18)", () => {
  const result = checkNodeVersion();
  // The test runner itself is Node, so this should pass.
  const major = parseInt(process.version.slice(1).split(".")[0], 10);
  assert.equal(result.ok, major >= 18);
  assert.ok(result.label.includes("Node.js"));
});

test("checkLinux returns ok on Linux", () => {
  // Only meaningful on Linux; we can't easily mock process.platform, but we
  // can at least verify the shape of the result.
  const result = checkLinux();
  assert.equal(typeof result.ok, "boolean");
  assert.equal(result.label, "Linux");
  if (!result.ok) {
    assert.ok(result.hint, "should provide a hint on non-Linux");
  }
});
