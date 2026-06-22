import { cn } from "@/lib/utils";

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "text-lg font-semibold tracking-[-0.02em] text-foreground",
        className,
      )}
    >
      OLEYIA
    </span>
  );
}
