"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type RideStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";

export type ActiveRide = {
  id: string;
  status: RideStatus;
  destination: string;
  estimatedPrice: number;
  driver: { name: string; licensePlate: string } | null;
};

const STEPS = [
  { key: "pending", label: "Demande envoyée" },
  { key: "accepted", label: "Conducteur en route" },
] as const;

function RideTimeline({ status }: { status: RideStatus }) {
  const activeIndex = status === "pending" ? 0 : 1;

  return (
    <ol aria-label="Suivi de la course" className="flex flex-col gap-3">
      {STEPS.map((step, index) => {
        const reached = index <= activeIndex;
        const isCurrent = index === activeIndex;

        return (
          <li key={step.key} className="flex items-center gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 shrink-0 rounded-full",
                reached ? "bg-brand-accent" : "bg-border",
              )}
            />
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "text-sm",
                reached ? "font-medium text-foreground" : "text-muted-foreground",
              )}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export function ActiveRidePanel({
  ride,
  onCancelled,
}: {
  ride: ActiveRide;
  onCancelled: () => void;
}) {
  const [isCancelling, setIsCancelling] = useState(false);

  async function handleCancel() {
    setIsCancelling(true);
    const response = await fetch(`/api/rides/${ride.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "cancel" }),
    });
    setIsCancelling(false);
    if (response.ok) onCancelled();
  }

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 rounded-t-lg bg-popover px-6 pt-6 shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]"
      style={{ paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))" }}
    >
      <div className="flex flex-col gap-2">
        <span className="text-base font-medium text-foreground">{ride.destination}</span>
        <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
          {ride.estimatedPrice} FCFA
        </span>
      </div>

      <RideTimeline status={ride.status} />
      <span className="sr-only" aria-live="polite" role="status">
        {ride.status === "pending" ? "Demande envoyée" : "Conducteur en route"}
      </span>

      {ride.driver && (
        <div className="flex flex-col gap-1 rounded-lg bg-secondary p-4">
          <span className="text-base font-medium text-foreground">{ride.driver.name}</span>
          <span className="text-sm text-muted-foreground">{ride.driver.licensePlate}</span>
        </div>
      )}

      <Button
        variant="secondary"
        className="w-full"
        loading={isCancelling}
        onClick={handleCancel}
      >
        Annuler la course
      </Button>
    </div>
  );
}
