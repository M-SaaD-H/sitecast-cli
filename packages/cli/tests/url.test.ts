// Tests for URL parsing logic extracted from the render command.
// Run with: node --test

import { test } from "node:test";
import assert from "node:assert/strict";

// Re-implement the small URL parsing helper so we can test it in isolation
// without importing the full render command (which would trigger Commander setup).
function parseUrl(raw: string): URL | null {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return null;
    return u;
  } catch {
    try {
      return new URL("https://" + raw);
    } catch {
      return null;
    }
  }
}

test("accepts https URLs", () => {
  const u = parseUrl("https://example.com");
  assert.ok(u, "expected a URL object");
  assert.equal(u!.href, "https://example.com/");
});

test("accepts http URLs", () => {
  const u = parseUrl("http://localhost:3000");
  assert.ok(u);
  assert.equal(u!.protocol, "http:");
});

test("rejects non-http schemes", () => {
  assert.equal(parseUrl("ftp://example.com"), null);
  assert.equal(parseUrl("file:///etc/passwd"), null);
});

test("rejects completely invalid strings", () => {
  assert.equal(parseUrl("not a url at all!!!"), null);
  assert.equal(parseUrl(""), null);
});

test("accepts bare domain by prepending https", () => {
  const u = parseUrl("example.com");
  assert.ok(u);
  assert.equal(u!.protocol, "https:");
});
