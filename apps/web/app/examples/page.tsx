"use client";

import React, { useState } from "react";
import { IconCopy, IconCheck, IconTerminal, IconCode } from "@tabler/icons-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function ExamplesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCmd = (cmd: string, id: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedId(id);
    toast.success("Command copied");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const examples = [
    {
      id: "ex1",
      title: "Basic Website Render",
      description: "Records a website with default settings (1280x720 resolution at 30 FPS with standard browser chrome).",
      command: "sitecast render https://example.com",
      tags: ["Default", "1280x720", "30 FPS"],
    },
    {
      id: "ex2",
      title: "Full HD 1080p at 60 FPS",
      description: "High-definition 1920x1080 resolution recording at 60 frames per second for smooth presentation video output.",
      command: "sitecast render https://example.com --width 1920 --height 1080 --fps 60",
      tags: ["1080p", "60 FPS", "HD Quality"],
    },
    {
      id: "ex3",
      title: "Dark Scheme Mode",
      description: "Forces prefers-color-scheme: dark preference in Chromium for modern dark theme website previews.",
      command: "sitecast render https://example.com --dark-mode",
      tags: ["Dark Theme", "Prefers-Color-Scheme"],
    },
    {
      id: "ex4",
      title: "Kiosk Mode (No Browser Chrome)",
      description: "Records full web page viewport without top browser address bar or window frame controls.",
      command: "sitecast render https://example.com --no-browser-frame",
      tags: ["Kiosk", "Borderless", "Clean Viewport"],
    },
    {
      id: "ex5",
      title: "Custom Destination Output Path",
      description: "Saves the output MP4 video to a specific directory path instead of default timestamp filename.",
      command: "sitecast render https://example.com --output ~/videos/product-demo.mp4",
      tags: ["Custom Path", "MP4"],
    },
    {
      id: "ex6",
      title: "Verbose Renderer Output",
      description: "Prints detailed Playwright browser logs and FFmpeg encoder progress for diagnostic debugging.",
      command: "sitecast render https://example.com --verbose",
      tags: ["Debugging", "Verbose Logs"],
    },
  ];

  return (
    <div className="container max-w-5xl mx-auto px-4 md:px-8 py-12">
      <div className="mb-10 border-b border-border pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2">
          <IconCode className="w-4 h-4" /> Command Recipes
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">CLI Usage Examples</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
          Common command recipes for recording product demos, documentation previews, dark mode showcases, and HD videos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {examples.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-lg border border-border bg-surface/40 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h2 className="font-medium text-base tracking-tight">{item.title}</h2>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed mb-4">
                {item.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {item.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-mono px-2 py-0.5 rounded border border-border bg-background text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-3 rounded bg-background border border-border flex items-center justify-between gap-2 font-mono text-xs overflow-x-auto">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis">
                <IconTerminal className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground select-all">{item.command}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => copyCmd(item.command, item.id)}
                className="shrink-0 h-7 px-2 text-xs"
              >
                {copiedId === item.id ? (
                  <IconCheck className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <IconCopy className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
