"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo, LogoDark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { IconCopy, IconCheck, IconTerminal } from "@tabler/icons-react";
import { FaGithub } from "react-icons/fa6";
import { toast } from "sonner";

export function Navbar() {
  const [copied, setCopied] = useState(false);
  const installCmd = "npm install -g sitecast";

  const handleCopy = () => {
    navigator.clipboard.writeText(installCmd);
    setCopied(true);
    toast.success("Command copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="container max-w-6xl mx-auto flex h-14 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Logo size="small" />
            <LogoDark size="small" />
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-base tracking-tight">Sitecast</span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-surface border border-border text-muted-foreground">
                CLI
              </span>
            </div>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <Link href="/docs" className="transition-colors hover:text-foreground">Docs</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="hidden sm:flex items-center gap-2 text-xs font-mono bg-surface hover:bg-surface-hover border border-border rounded-md px-3 py-1.5 transition-colors cursor-pointer text-foreground"
            title="Click to copy install command"
          >
            <IconTerminal className="w-3.5 h-3.5 text-muted-foreground" />
            <span>{installCmd}</span>
            {copied ? (
              <IconCheck className="w-3.5 h-3.5 text-foreground" />
            ) : (
              <IconCopy className="w-3.5 h-3.5 text-muted-foreground" />
            )}
          </button>

          <a
            href="https://github.com/M-SaaD-H/sitecast-cli"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2"
            aria-label="GitHub Repository"
          >
            <FaGithub className="w-5 h-5" />
          </a>

          <Link href="/docs" className="sm:hidden">
            <Button size="sm" variant="outline">
              Docs
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

