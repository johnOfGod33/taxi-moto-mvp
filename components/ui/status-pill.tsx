import type React from "react";
import { cn } from "@/lib/utils";

export type StatusPillVariant = "go" | "neutral";

export function StatusPill({
  variant,
  className,
  children,
}: {
  variant: StatusPillVariant;
  className?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.8125rem] font-medium leading-[1.3]",
        variant === "go" && "bg-brand-accent text-brand-accent-foreground",
        variant === "neutral" && "bg-secondary text-muted-foreground",
        className,
      )}
      data-slot="status-pill"
    >
      {children}
    </span>
  );
}
