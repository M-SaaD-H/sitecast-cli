"use client";

import React, { useState } from "react";
import { IconCopy, IconCheck, IconTerminal, IconBook, IconStethoscope, IconAdjustments, IconAlertCircle } from "@tabler/icons-react";
import { toast } from "sonner";

export default function DocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-10 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
          <IconBook className="w-4 h-4" /> Documentation &amp; CLI Reference
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">Sitecast CLI Manual</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Everything you need to know about installing, configuring, running, and troubleshooting Sitecast CLI on your Linux system.
        </p>
      </div>

      <div className="grid md:grid-cols-4 gap-8">
        {/* Sidebar Navigation */}
        <aside className="hidden md:block space-y-1 text-sm text-muted-foreground sticky top-20 self-start">
          <div className="font-semibold text-xs font-mono text-foreground uppercase tracking-wider mb-2">
            Contents
          </div>
          <a href="#quickstart" className="block py-1 hover:text-foreground transition-colors">Quickstart</a>
          <a href="#requirements" className="block py-1 hover:text-foreground transition-colors">System Requirements</a>
          <a href="#commands" className="block py-1 hover:text-foreground transition-colors">Command Reference</a>
          <a href="#flags" className="block py-1 hover:text-foreground transition-colors">CLI Options &amp; Flags</a>
          <a href="#env-vars" className="block py-1 hover:text-foreground transition-colors">Environment Variables</a>
          <a href="#troubleshooting" className="block py-1 hover:text-foreground transition-colors">Troubleshooting</a>
        </aside>

        {/* Main Docs Content */}
        <div className="md:col-span-3 space-y-12">
          
          {/* Quickstart */}
          <section id="quickstart" className="scroll-mt-20">
            <h2 className="text-xl font-semibold tracking-tight mb-3 flex items-center gap-2">
              <IconTerminal className="w-5 h-5 text-muted-foreground" /> Quickstart Guide
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Install Sitecast globally via npm, check system dependencies using <code className="font-mono bg-surface px-1.5 py-0.5 rounded border border-border">sitecast doctor</code>, and record your first website video.
            </p>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-md border border-border bg-surface flex items-center justify-between">
                <code className="text-foreground">npm install -g sitecast</code>
                <button
                  onClick={() => copyToClipboard("npm install -g sitecast", "qs1")}
                  className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  {copiedCode === "qs1" ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-md border border-border bg-surface flex items-center justify-between">
                <code className="text-foreground">sitecast doctor</code>
                <button
                  onClick={() => copyToClipboard("sitecast doctor", "qs2")}
                  className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  {copiedCode === "qs2" ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
              </div>

              <div className="p-4 rounded-md border border-border bg-surface flex items-center justify-between">
                <code className="text-foreground">sitecast render https://example.com</code>
                <button
                  onClick={() => copyToClipboard("sitecast render https://example.com", "qs3")}
                  className="text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                >
                  {copiedCode === "qs3" ? <IconCheck className="w-4 h-4 text-emerald-500" /> : <IconCopy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          {/* System Requirements */}
          <section id="requirements" className="scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-3 flex items-center gap-2">
              <IconStethoscope className="w-5 h-5 text-muted-foreground" /> System Requirements
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
              <li><strong className="text-foreground">OS:</strong> Linux (Ubuntu 20.04+, Debian, Arch Linux, Fedora, WSL2)</li>
              <li><strong className="text-foreground">Node.js:</strong> Version 18.0.0 or later</li>
              <li><strong className="text-foreground">FFmpeg:</strong> Installed in system PATH with libx264 support</li>
              <li><strong className="text-foreground">Xvfb:</strong> Virtual X11 display server (<code className="font-mono text-xs">xorg-server-xvfb</code> or <code className="font-mono text-xs">xvfb</code>)</li>
              <li><strong className="text-foreground">Browser:</strong> Google Chrome or Chromium (or managed Playwright Chromium via <code className="font-mono text-xs">sitecast setup</code>)</li>
            </ul>

            <div className="mt-4 p-4 rounded-md border border-border bg-surface/50 text-xs text-muted-foreground space-y-2">
              <div className="font-mono font-semibold text-foreground">Installing system dependencies on Ubuntu:</div>
              <code className="block font-mono bg-background p-2 rounded border border-border text-foreground">
                sudo apt update &amp;&amp; sudo apt install ffmpeg xvfb x11-utils chromium-browser
              </code>
              <div className="font-mono font-semibold text-foreground pt-2">Installing system dependencies on Arch Linux:</div>
              <code className="block font-mono bg-background p-2 rounded border border-border text-foreground">
                sudo pacman -S ffmpeg xorg-server-xvfb xorg-xdpyinfo chromium
              </code>
            </div>
          </section>

          {/* Command Reference */}
          <section id="commands" className="scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
              <IconTerminal className="w-5 h-5 text-muted-foreground" /> Command Reference
            </h2>

            <div className="space-y-6">
              <div className="p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="font-mono font-semibold text-sm text-foreground">sitecast render &lt;url&gt; [options]</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Main command to record a website. Opens the URL in a headed Chromium browser under Xvfb, performs human-like top-to-bottom scrolling, and outputs an MP4 video file.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="font-mono font-semibold text-sm text-foreground">sitecast doctor</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Runs environment diagnostic checks for Linux kernel, Node.js version, FFmpeg binary, Xvfb display server, xdpyinfo utility, Chrome executable, and temp folder write permissions.
                </p>
              </div>

              <div className="p-5 rounded-lg border border-border bg-background space-y-2">
                <div className="font-mono font-semibold text-sm text-foreground">sitecast setup</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Downloads and installs a Playwright-managed Chromium build to <code className="font-mono text-xs">~/.cache/ms-playwright/</code> if system Chrome is not present.
                </p>
              </div>
            </div>
          </section>

          {/* Options & Flags */}
          <section id="flags" className="scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
              <IconAdjustments className="w-5 h-5 text-muted-foreground" /> Options &amp; Flags
            </h2>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-surface border-b border-border text-foreground">
                  <tr>
                    <th className="p-3">Flag / Option</th>
                    <th className="p-3">Default</th>
                    <th className="p-3 font-sans">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 text-foreground font-bold">-o, --output &lt;path&gt;</td>
                    <td className="p-3">./sitecast-&lt;timestamp&gt;.mp4</td>
                    <td className="p-3 font-sans">Destination file path for the recorded MP4 video</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">--width &lt;px&gt;</td>
                    <td className="p-3">1280</td>
                    <td className="p-3 font-sans">Viewport width in pixels</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">--height &lt;px&gt;</td>
                    <td className="p-3">720</td>
                    <td className="p-3 font-sans">Viewport height in pixels</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">--fps &lt;n&gt;</td>
                    <td className="p-3">30</td>
                    <td className="p-3 font-sans">Recording frame rate (e.g. 30 or 60)</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">--no-browser-frame</td>
                    <td className="p-3">false</td>
                    <td className="p-3 font-sans">Record in kiosk mode without browser address bar chrome</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">--dark-mode</td>
                    <td className="p-3">false</td>
                    <td className="p-3 font-sans">Forces prefers-color-scheme: dark in Chromium</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">-v, --verbose</td>
                    <td className="p-3">false</td>
                    <td className="p-3 font-sans">Print full FFmpeg and Playwright renderer debug output</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Environment Variables */}
          <section id="env-vars" className="scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4">Environment Variables</h2>

            <div className="overflow-x-auto border border-border rounded-lg">
              <table className="w-full text-left text-xs font-mono">
                <tbody className="divide-y divide-border text-muted-foreground">
                  <tr>
                    <td className="p-3 text-foreground font-bold">CHROME_EXECUTABLE</td>
                    <td className="p-3">Auto-detected</td>
                    <td className="p-3 font-sans">Override path to Chromium or Google Chrome binary</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">FFMPEG_BIN</td>
                    <td className="p-3">ffmpeg</td>
                    <td className="p-3 font-sans">Override binary path for FFmpeg executable</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-foreground font-bold">XVFB_DISPLAY_START</td>
                    <td className="p-3">99</td>
                    <td className="p-3 font-sans">First virtual X11 display number used for rendering</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="scroll-mt-20 border-t border-border pt-8">
            <h2 className="text-xl font-semibold tracking-tight mb-4 flex items-center gap-2">
              <IconAlertCircle className="w-5 h-5 text-muted-foreground" /> Troubleshooting
            </h2>

            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-md border border-border bg-surface/30">
                <div className="font-semibold text-foreground mb-1">Missing Xvfb or display error</div>
                <p className="text-muted-foreground leading-relaxed">
                  Install <code className="font-mono bg-background px-1 border border-border">xvfb</code> using your package manager. On Ubuntu: <code className="font-mono">sudo apt install xvfb</code>. On Arch: <code className="font-mono">sudo pacman -S xorg-server-xvfb</code>.
                </p>
              </div>

              <div className="p-4 rounded-md border border-border bg-surface/30">
                <div className="font-semibold text-foreground mb-1">Missing FFmpeg</div>
                <p className="text-muted-foreground leading-relaxed">
                  Sitecast requires FFmpeg to record virtual X11 display output. Run <code className="font-mono">sitecast doctor</code> to confirm FFmpeg detection.
                </p>
              </div>

              <div className="p-4 rounded-md border border-border bg-surface/30">
                <div className="font-semibold text-foreground mb-1">Temporary directory write permission</div>
                <p className="text-muted-foreground leading-relaxed">
                  Ensure your user account has write access to <code className="font-mono">/tmp</code> where frame buffers and temporary pipes are created during recording.
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
