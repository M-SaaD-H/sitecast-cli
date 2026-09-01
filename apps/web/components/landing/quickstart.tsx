"use client";

import React, { useState } from "react";
import { IconStethoscope, IconCopy, IconCheck, IconTerminal } from "@tabler/icons-react";
import { toast } from "sonner";

export function Quickstart() {
  const [copiedDoctor, setCopiedDoctor] = useState(false);
  const [copiedSetup, setCopiedSetup] = useState(false);

  const copyCmd = (cmd: string, type: "doctor" | "setup") => {
    navigator.clipboard.writeText(cmd);
    if (type === "doctor") {
      setCopiedDoctor(true);
      setTimeout(() => setCopiedDoctor(false), 2000);
    } else {
      setCopiedSetup(true);
      setTimeout(() => setCopiedSetup(false), 2000);
    }
    toast.success(`Copied: ${cmd}`);
  };

  return (
    <section className="py-16 border-t border-border bg-background">
      <div className="container max-w-4xl mx-auto px-4 md:px-8">
        <div className="flex items-center gap-2 mb-2">
          <IconStethoscope className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-2xl font-semibold tracking-tight">System Doctor &amp; Setup Helper</h2>
        </div>
        <p className="text-sm text-muted-foreground mb-8">
          Sitecast includes diagnostic utilities to verify your system environment before rendering.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Doctor Card */}
          <div className="p-6 rounded-lg border border-border bg-surface/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-semibold text-foreground">1. Verify System Setup</h3>
                <button
                  onClick={() => copyCmd("sitecast doctor", "doctor")}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 p-1 cursor-pointer"
                >
                  {copiedDoctor ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                  <span>sitecast doctor</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                Checks Linux OS, Node.js version, FFmpeg, Xvfb virtual display, xdpyinfo, and Chrome/Chromium installation.
              </p>

              {/* Sample Doctor Terminal Output */}
              <div className="p-3 rounded bg-background border border-border font-mono text-xs text-muted-foreground space-y-1">
                <div className="text-foreground font-semibold">Sitecast environment</div>
                <div className="text-emerald-600 dark:text-emerald-400">[ok] Linux</div>
                <div className="text-emerald-600 dark:text-emerald-400">[ok] Node.js v24.11.1</div>
                <div className="text-emerald-600 dark:text-emerald-400">[ok] FFmpeg (n8.1.2)</div>
                <div className="text-emerald-600 dark:text-emerald-400">[ok] Xvfb &amp; xdpyinfo</div>
                <div className="text-emerald-600 dark:text-emerald-400">[ok] Chromium</div>
                <div className="text-foreground font-medium pt-1">Ready to render.</div>
              </div>
            </div>
          </div>

          {/* Setup Card */}
          <div className="p-6 rounded-lg border border-border bg-surface/40 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-mono text-sm font-semibold text-foreground">2. Install Managed Chromium</h3>
                <button
                  onClick={() => copyCmd("sitecast setup", "setup")}
                  className="text-xs font-mono text-muted-foreground hover:text-foreground flex items-center gap-1 p-1 cursor-pointer"
                >
                  {copiedSetup ? <IconCheck className="w-3.5 h-3.5 text-emerald-500" /> : <IconCopy className="w-3.5 h-3.5" />}
                  <span>sitecast setup</span>
                </button>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                If your system Chrome is missing or incompatible, sitecast setup downloads a verified Chromium binary locally.
              </p>

              {/* Package dependencies list */}
              <div className="p-3 rounded bg-background border border-border space-y-2 text-xs">
                <span className="font-mono font-semibold text-foreground block">System dependencies (Ubuntu / Debian):</span>
                <code className="block font-mono bg-surface p-2 rounded text-muted-foreground break-all">
                  sudo apt install ffmpeg xvfb x11-utils
                </code>
                <span className="font-mono font-semibold text-foreground block pt-1">System dependencies (Arch Linux):</span>
                <code className="block font-mono bg-surface p-2 rounded text-muted-foreground break-all">
                  sudo pacman -S ffmpeg xorg-server-xvfb xorg-xdpyinfo
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
