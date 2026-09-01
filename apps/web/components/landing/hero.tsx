"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconArrowRight, IconTerminal } from "@tabler/icons-react";
import { toast } from "sonner";

export function Hero() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm install -g sitecast";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="py-16 md:py-24 border-b border-border">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-xs font-mono text-muted-foreground mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>100% Free &amp; Open Source</span>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.15] max-w-3xl">
          Record website demo videos directly from your terminal.
        </h1>

        <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Sitecast runs a headless Chromium browser locally, smoothly scrolls through any website, and outputs a high-definition MP4 video. No accounts, no subscriptions, no cloud APIs.
        </p>

        {/* Command Copy Box */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <div className="flex-1 flex items-center justify-between gap-3 w-full bg-surface border border-border rounded-md px-4 py-3 font-mono text-sm">
            <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap">
              <IconTerminal className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground select-all">{installCmd}</span>
            </div>
            <button
              onClick={handleCopy}
              className="text-muted-foreground hover:text-foreground transition-colors shrink-0 p-1 cursor-pointer"
              title="Copy command"
            >
              {copied ? (
                <IconCheck className="w-4 h-4 text-emerald-500" />
              ) : (
                <IconCopy className="w-4 h-4" />
              )}
            </button>
          </div>

          <Link href="/docs" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto">
              Docs <IconArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        {/* Minimal Meta badges */}
        <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs font-mono text-muted-foreground">
          <span>Supported: Linux</span>
          <span>•</span>
          <span>Requires: Node.js 18+, FFmpeg, Xvfb</span>
        </div>

      </div>
    </section>
  );
}
