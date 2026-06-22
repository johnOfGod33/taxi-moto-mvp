import { MapPinIcon } from "lucide-react";

export function RouteSummary({
  originLabel,
  originHint,
  destination,
}: {
  originLabel: string | null;
  originHint?: string;
  destination: string;
}) {
  return (
    <div className="flex flex-col">
      <div className="flex gap-2.5">
        <div className="flex w-4 shrink-0 flex-col items-center pt-1.5">
          <span aria-hidden="true" className="size-2 shrink-0 rounded-full bg-foreground" />
        </div>
        <div className="flex flex-col gap-0.5 pb-1">
          <span className="text-xs text-muted-foreground">Position du client</span>
          <span className="text-sm text-foreground">
            {originLabel ?? "Position non précisée"}
          </span>
          {originHint && <span className="text-xs text-muted-foreground">{originHint}</span>}
        </div>
      </div>
      <div className="ml-2 h-3 w-px bg-border" aria-hidden="true" />
      <div className="flex gap-2.5 pt-1">
        <div className="flex w-4 shrink-0 items-center justify-center">
          <MapPinIcon aria-hidden="true" className="size-4 text-foreground" />
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-muted-foreground">Destination</span>
          <span className="text-sm text-foreground">{destination}</span>
        </div>
      </div>
    </div>
  );
}
