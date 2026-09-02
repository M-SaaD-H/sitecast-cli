import Link from "next/link";
import { Logo, LogoDark } from "@/components/ui/logo";
import { FaGithub } from "react-icons/fa6";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background py-12 text-sm">
      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-border">
          <div className="flex items-center gap-3">
            <Logo size="small" />
            <LogoDark size="small" />
            <div>
              <span className="font-semibold text-foreground">Sitecast CLI</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                Free open-source website demo recorder. Runs 100% locally on your system.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
            <Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link>
            <a
              href="https://github.com/M-SaaD-H/sitecast-cli"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors inline-flex items-center gap-1.5"
            >
              <FaGithub className="w-4 h-4" />
              <span>GitHub</span>
            </a>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-xs text-muted-foreground">
          <p>Released under the MIT License. Free for commercial and personal use.</p>
          <p className="font-mono">Linux supported</p>
        </div>
      </div>
    </footer>
  );
}

