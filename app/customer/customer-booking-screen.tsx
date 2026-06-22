"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ConfirmRideDialog } from "./confirm-ride-dialog";
import { DestinationSearch } from "./destination-search";
import {
  DEFAULT_CENTER,
  reverseGeocode,
  type AddressResult,
  type Coordinates,
  type RideEstimate,
} from "@/lib/geo";

const BookingMap = dynamic(() => import("./booking-map"), {
  ssr: false,
  loading: () => <div className="absolute inset-0 z-0 bg-secondary" />,
});

export function CustomerBookingScreen() {
  const [origin, setOrigin] = useState<Coordinates>(DEFAULT_CENTER);
  const [usingFallbackCenter, setUsingFallbackCenter] = useState(
    () => typeof navigator === "undefined" || !("geolocation" in navigator),
  );
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setOrigin({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {
        setUsingFallbackCenter(true);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  async function handleSelectDestination(point: Coordinates, knownLabel?: string) {
    setDestination(point);
    setDestinationLabel(knownLabel ?? null);
    setEstimate(null);
    setIsEstimating(true);

    const [label, estimateResponse] = await Promise.all([
      knownLabel ? Promise.resolve(knownLabel) : reverseGeocode(point),
      fetch("/api/rides/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination: point }),
      }).then((res) => (res.ok ? res.json() : null)),
    ]);

    setDestinationLabel(label ?? "Position sélectionnée");
    setEstimate(estimateResponse);
    setIsEstimating(false);
  }

  function handleSearchSelect(result: AddressResult) {
    handleSelectDestination(result.point, result.label);
  }

  return (
    <main className="relative flex flex-1 flex-col">
      <BookingMap
        origin={origin}
        destination={destination}
        onSelectDestination={handleSelectDestination}
      />

      <div
        className="absolute inset-x-0 z-10 flex flex-col items-center gap-2 px-4"
        style={{ top: "max(1rem, calc(env(safe-area-inset-top) + 0.5rem))" }}
      >
        <div className="w-full max-w-md">
          <DestinationSearch onSelect={handleSearchSelect} />
        </div>
        {usingFallbackCenter && (
          <p className="rounded-full bg-popover px-4 py-2 text-xs text-muted-foreground shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]">
            Position approximative (Lomé)
          </p>
        )}
      </div>

      {!destination && (
        <p
          className="absolute left-1/2 z-10 -translate-x-1/2 rounded-full bg-popover px-4 py-2 text-sm text-foreground shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]"
          style={{ bottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))" }}
        >
          Touchez la carte pour choisir votre destination
        </p>
      )}

      {destination && (
        <div
          className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-4 rounded-t-lg bg-popover px-6 pt-6 shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]"
          style={{ paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))" }}
        >
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Destination</span>
            <span className="text-base font-medium text-foreground">
              {destinationLabel ?? "Recherche de l'adresse…"}
            </span>
          </div>

          {isEstimating && (
            <p className="text-sm text-muted-foreground">Calcul du prix…</p>
          )}

          {estimate && (
            <div className="flex items-end justify-between">
              <div className="flex flex-col">
                <span className="text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
                  {estimate.estimatedPrice} FCFA
                </span>
                <span className="text-sm text-muted-foreground">
                  ~{estimate.etaMinutes} min · {estimate.distanceKm.toFixed(1)} km
                </span>
              </div>
            </div>
          )}

          {estimate && (
            <ConfirmRideDialog
              origin={origin}
              destination={destination}
              destinationLabel={destinationLabel}
              estimate={estimate}
            />
          )}
        </div>
      )}
    </main>
  );
}
