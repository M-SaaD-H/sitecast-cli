"use client";

import * as React from "react";
import { IconChevronDown } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export function AccordionItem({ title, children, defaultOpen = false }: AccordionItemProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  return (
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left font-medium transition-colors hover:text-foreground text-sm md:text-base cursor-pointer py-1"
        aria-expanded={isOpen}
      >
        <span>{title}</span>
        <IconChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>
      {isOpen && (
        <div className="pt-2 pb-1 text-sm text-muted-foreground leading-relaxed animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
}
