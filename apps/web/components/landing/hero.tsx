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
    <section className="py-16 md:py-24">
      <div className="container max-w-5xl mx-auto px-4 md:px-8 text-center flex flex-col items-center">

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight leading-[1.15] max-w-3xl">
          Turn any website into a demo video from your terminal.
        </h1>

        <p className="mt-2 text-base sm:text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Sitecast runs Chromium locally, automatically records your website, and outputs a high-definition MP4. No accounts. No subscriptions. No cloud.
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
