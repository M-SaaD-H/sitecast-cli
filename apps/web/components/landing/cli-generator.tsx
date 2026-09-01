"use client";

import React, { useState } from "react";
import { IconCopy, IconCheck, IconAdjustments, IconTerminal } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function CliGenerator() {
  const [url, setUrl] = useState("https://example.com");
  const [output, setOutput] = useState("demo.mp4");
  const [width, setWidth] = useState("1280");
  const [height, setHeight] = useState("720");
  const [fps, setFps] = useState("30");
  const [darkMode, setDarkMode] = useState(false);
  const [noBrowserFrame, setNoBrowserFrame] = useState(false);
  const [copied, setCopied] = useState(false);

  const buildCommand = () => {
    let cmd = `sitecast render ${url.trim() || "https://example.com"}`;
    if (output && output !== "sitecast-<timestamp>.mp4") {
      cmd += ` -o ${output}`;
    }
    if (width !== "1280") {
      cmd += ` --width ${width}`;
    }
    if (height !== "720") {
      cmd += ` --height ${height}`;
    }
    if (fps !== "30") {
      cmd += ` --fps ${fps}`;
    }
    if (darkMode) {
      cmd += ` --dark-mode`;
    }
    if (noBrowserFrame) {
      cmd += ` --no-browser-frame`;
    }
    return cmd;
  };

  const generatedCmd = buildCommand();

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCmd);
    setCopied(true);
    toast.success("CLI command copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 border-t border-border bg-background">
      <div className="container max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 mb-2">
          <IconAdjustments className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">Interactive CLI Command Builder</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Configure recording options below to generate your exact CLI command.
        </p>

        <div className="grid md:grid-cols-2 gap-6 p-6 rounded-lg border border-border bg-surface/50">
          {/* Controls */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground uppercase mb-1.5">
                Target URL
              </label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1.5">
                  Width (px)
                </label>
                <select
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                >
                  <option value="1280">1280 (Standard HD)</option>
                  <option value="1920">1920 (Full HD 1080p)</option>
                  <option value="1440">1440 (2K Viewport)</option>
                  <option value="800">800 (Compact Window)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1.5">
                  Height (px)
                </label>
                <select
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                >
                  <option value="720">720 (Standard HD)</option>
                  <option value="1080">1080 (Full HD)</option>
                  <option value="900">900 (Desktop View)</option>
                  <option value="600">600 (Compact View)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1.5">
                  Frame Rate (FPS)
                </label>
                <select
                  value={fps}
                  onChange={(e) => setFps(e.target.value)}
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                >
                  <option value="30">30 FPS (Default)</option>
                  <option value="60">60 FPS (Ultra Smooth)</option>
                  <option value="24">24 FPS (Cinematic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-muted-foreground uppercase mb-1.5">
                  Output File
                </label>
                <input
                  type="text"
                  value={output}
                  onChange={(e) => setOutput(e.target.value)}
                  placeholder="demo.mp4"
                  className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-ring font-mono"
                />
              </div>
            </div>

            {/* Checkboxes */}
            <div className="pt-2 space-y-2">
              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={darkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  className="rounded border-border accent-primary cursor-pointer w-4 h-4"
                />
                <span>Enable dark color scheme</span>
              </label>

              <label className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={noBrowserFrame}
                  onChange={(e) => setNoBrowserFrame(e.target.checked)}
                  className="rounded border-border accent-primary cursor-pointer w-4 h-4"
                />
                <span>Kiosk mode (record without browser frame)</span>
              </label>
            </div>
          </div>

          {/* Generated Command Box */}
          <div className="flex flex-col justify-between p-5 rounded-md border border-border bg-background">
            <div>
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-border">
                <span className="text-xs font-mono text-muted-foreground uppercase flex items-center gap-1.5">
                  <IconTerminal className="w-3.5 h-3.5" /> Generated Command
                </span>
                <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  Ready to run
                </span>
              </div>

              <div className="p-3 rounded bg-surface border border-border font-mono text-xs text-foreground break-all leading-relaxed">
                {generatedCmd}
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button onClick={handleCopy} className="flex-1">
                {copied ? (
                  <>
                    <IconCheck className="w-4 h-4" /> Copied Command
                  </>
                ) : (
                  <>
                    <IconCopy className="w-4 h-4" /> Copy Command
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
