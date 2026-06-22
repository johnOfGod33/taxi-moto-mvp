"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Coordinates, RideEstimate } from "@/lib/geo";

type DriverInfo = { name: string; licensePlate: string };
type RideStatus = "pending" | "accepted" | "declined" | "completed";

type SearchState =
  | { phase: "idle" }
  | { phase: "searching" }
  | { phase: "matched"; rideId: string; status: RideStatus; driver: DriverInfo }
  | { phase: "no-driver" }
  | { phase: "error" };

const POLL_INTERVAL_MS = 3000;

export function ConfirmRideDialog({
  origin,
  destination,
  destinationLabel,
  estimate,
}: {
  origin: Coordinates;
  destination: Coordinates;
  destinationLabel: string | null;
  estimate: RideEstimate;
}) {
  const [state, setState] = useState<SearchState>({ phase: "idle" });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function pollRide(rideId: string) {
    stopPolling();
    pollRef.current = setInterval(async () => {
      const response = await fetch(`/api/rides/${rideId}`);
      if (!response.ok) return;

      const data = await response.json();
      setState((current) => {
        if (current.phase !== "matched") return current;
        return { ...current, status: data.status };
      });

      if (data.status !== "pending") stopPolling();
    }, POLL_INTERVAL_MS);
  }

  async function handleSearchDriver() {
    setState({ phase: "searching" });

    const response = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination: destinationLabel ?? `${destination.lat},${destination.lng}`,
        estimatedPrice: estimate.estimatedPrice,
      }),
    });

    if (response.status === 409) {
      setState({ phase: "no-driver" });
      return;
    }

    if (!response.ok) {
      setState({ phase: "error" });
      return;
    }

    const data = await response.json();
    setState({ phase: "matched", rideId: data.id, status: data.status, driver: data.driver });
    pollRide(data.id);
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      stopPolling();
      setState({ phase: "idle" });
    }
  }

  return (
    <Dialog onOpenChange={handleOpenChange}>
      <DialogTrigger render={<Button size="lg" className="w-full" />}>
        Confirmer la course
      </DialogTrigger>
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Confirmer la course</DialogTitle>
          <DialogDescription>
            Vérifiez les détails avant de confirmer.
          </DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Destination</span>
            <span className="text-base text-foreground">{destinationLabel}</span>
          </div>
          <div className="flex items-end justify-between">
            <span className="text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {estimate.estimatedPrice} FCFA
            </span>
            <span className="text-sm text-muted-foreground">~{estimate.etaMinutes} min</span>
          </div>

          {state.phase === "idle" && (
            <p className="text-sm text-muted-foreground">
              On recherche le conducteur disponible le plus proche.
            </p>
          )}

          {state.phase === "searching" && (
            <p className="text-sm text-muted-foreground">Recherche d&apos;un conducteur…</p>
          )}

          {state.phase === "no-driver" && (
            <p className="text-sm text-destructive">
              Aucun conducteur disponible pour le moment. Réessayez dans un instant.
            </p>
          )}

          {state.phase === "error" && (
            <p className="text-sm text-destructive">
              Une erreur est survenue. Réessayez.
            </p>
          )}

          {state.phase === "matched" && (
            <div className="flex flex-col gap-2 rounded-lg bg-secondary p-4">
              <span className="text-base font-medium text-foreground">
                {state.driver.name}
              </span>
              <span className="text-sm text-muted-foreground">
                {state.driver.licensePlate}
              </span>
              {state.status === "pending" && (
                <span className="text-sm text-muted-foreground">
                  En attente de confirmation du conducteur…
                </span>
              )}
              {state.status === "accepted" && (
                <span className="text-sm font-medium text-foreground">
                  Course acceptée — le conducteur arrive.
                </span>
              )}
              {state.status === "declined" && (
                <span className="text-sm text-destructive">
                  Le conducteur a refusé la course.
                </span>
              )}
            </div>
          )}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>
            {state.phase === "matched" && state.status === "accepted" ? "Fermer" : "Annuler"}
          </DialogClose>
          {(state.phase === "idle" ||
            state.phase === "no-driver" ||
            state.phase === "error" ||
            (state.phase === "matched" && state.status === "declined")) && (
            <Button onClick={handleSearchDriver}>Rechercher un conducteur</Button>
          )}
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
