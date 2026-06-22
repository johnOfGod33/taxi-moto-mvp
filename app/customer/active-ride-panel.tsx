"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ContactRow } from "@/components/contact-row";
import { cn } from "@/lib/utils";

type RideStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "declined"
  | "cancelled"
  | "completed";

export type ActiveRide = {
  id: string;
  status: RideStatus;
  destination: string;
  estimatedPrice: number;
  driver: { name: string; licensePlate: string; phone: string } | null;
};

const STEPS = [
  { key: "pending", label: "Demande envoyée" },
  { key: "accepted", label: "Conducteur en route" },
  { key: "in_progress", label: "Course en cours" },
] as const;

function RideTimeline({ status }: { status: RideStatus }) {
  const foundIndex = STEPS.findIndex((step) => step.key === status);
  const currentIndex = foundIndex === -1 ? 0 : foundIndex;

  return (
    <ol aria-label="Suivi de la course" className="flex flex-col">
      {STEPS.map((step, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        const reached = index <= currentIndex;
        const isLast = index === STEPS.length - 1;

        return (
          <li key={step.key} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                aria-hidden="true"
                className={cn(
                  "z-10 mt-1 size-2.5 shrink-0 rounded-full",
                  reached ? "bg-brand-accent" : "bg-border",
                )}
              />
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn("w-px flex-1", isDone ? "bg-brand-accent" : "bg-border")}
                />
              )}
            </div>
            <span
              aria-current={isCurrent ? "step" : undefined}
              className={cn(
                "pb-3 text-sm",
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
        {ride.status === "pending" && "Demande envoyée"}
        {ride.status === "accepted" && "Conducteur en route"}
        {ride.status === "in_progress" && "Course en cours"}
      </span>

      {ride.driver && (
        <ContactRow
          name={ride.driver.name}
          subtitle={ride.driver.licensePlate}
          phone={ride.driver.phone}
        />
      )}

      {ride.status !== "in_progress" && (
        <Button
          variant="secondary"
          className="w-full"
          loading={isCancelling}
          onClick={handleCancel}
        >
          Annuler la course
        </Button>
      )}
    </div>
  );
}
