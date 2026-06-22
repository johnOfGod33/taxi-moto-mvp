"use client";

import { CheckIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteSummary } from "@/components/route-summary";

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  cash: "Cash",
  flooz: "Flooz",
  tmoney: "T-Money",
};

export type CompletedRide = {
  originLabel: string | null;
  destination: string;
  estimatedPrice: number;
  distanceKm: number | null;
  etaMinutes: number | null;
  paymentMethod: string | null;
};

export function RideCompletedScreen({
  ride,
  onNewRide,
}: {
  ride: CompletedRide;
  onNewRide: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 bg-background px-6 py-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-brand-accent">
          <CheckIcon aria-hidden="true" className="size-7 text-brand-accent-foreground" />
        </span>
        <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
          Course terminée
        </h1>
      </div>

      <div className="flex w-full max-w-sm flex-col gap-3 rounded-lg border border-border p-5">
        <RouteSummary originLabel={ride.originLabel} destination={ride.destination} />
        {ride.distanceKm !== null && ride.etaMinutes !== null && (
          <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
            <span className="text-sm text-muted-foreground">Distance · durée</span>
            <span className="text-sm font-medium text-foreground">
              {ride.distanceKm.toFixed(1)} km · {ride.etaMinutes} min
            </span>
          </div>
        )}
        {ride.paymentMethod && (
          <div className="flex items-center justify-between gap-4">
            <span className="text-sm text-muted-foreground">Paiement</span>
            <span className="text-sm font-medium text-foreground">
              {PAYMENT_METHOD_LABELS[ride.paymentMethod] ?? ride.paymentMethod}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
          <span className="text-sm text-muted-foreground">Payé</span>
          <span className="text-lg font-semibold text-foreground">
            {ride.estimatedPrice} FCFA
          </span>
        </div>
      </div>

      <Button size="lg" className="w-full max-w-sm" onClick={onNewRide}>
        Nouvelle course
      </Button>
    </main>
  );
}
