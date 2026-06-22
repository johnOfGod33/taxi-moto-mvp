"use client";

import { MapPinIcon } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ActiveRidePanel, type ActiveRide } from "./active-ride-panel";
import { ConfirmRideDialog, type ConfirmResult } from "./confirm-ride-dialog";
import { DestinationSearch } from "./destination-search";
import { RideCompletedScreen, type CompletedRide } from "./ride-completed-screen";
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

const POLL_INTERVAL_MS = 3000;

export function CustomerBookingScreen() {
  const [origin, setOrigin] = useState<Coordinates>(DEFAULT_CENTER);
  const [originLabel, setOriginLabel] = useState<string | null>(null);
  const [isEditingOrigin, setIsEditingOrigin] = useState(false);
  const [usingFallbackCenter, setUsingFallbackCenter] = useState(false);
  const [destination, setDestination] = useState<Coordinates | null>(null);
  const [destinationLabel, setDestinationLabel] = useState<string | null>(null);
  const [estimate, setEstimate] = useState<RideEstimate | null>(null);
  const [isEstimating, setIsEstimating] = useState(false);
  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [completedRide, setCompletedRide] = useState<CompletedRide | null>(null);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const timeout = setTimeout(() => {
        setUsingFallbackCenter(true);
        setOriginLabel("Lomé (position approximative)");
      });
      return () => clearTimeout(timeout);
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const point = { lat: position.coords.latitude, lng: position.coords.longitude };
        setOrigin(point);
        reverseGeocode(point).then((label) => {
          setOriginLabel((current) => (current === null ? label ?? "Position actuelle" : current));
        });
      },
      () => {
        setUsingFallbackCenter(true);
        setOriginLabel("Lomé (position approximative)");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  useEffect(() => {
    fetch("/api/rides/active")
      .then((res) => (res.ok ? res.json() : null))
      .then((ride) => {
        if (ride) setActiveRide(ride);
      });
  }, []);

  const activeRideId = activeRide?.id;
  const activeRideStatus = activeRide?.status;

  useEffect(() => {
    if (!activeRideId) return;
    if (activeRideStatus !== "pending" && activeRideStatus !== "accepted") return;

    const interval = setInterval(async () => {
      const response = await fetch(`/api/rides/${activeRideId}`);
      if (!response.ok) return;
      const data = await response.json();
      if (data.status === "completed") {
        setActiveRide(null);
        setCompletedRide({
          destination: data.destination,
          estimatedPrice: data.estimatedPrice,
          distanceKm: data.distanceKm,
          etaMinutes: data.etaMinutes,
          paymentMethod: data.paymentMethod,
        });
        return;
      }
      if (data.status === "cancelled") {
        setActiveRide(null);
        setDestination(null);
        setDestinationLabel(null);
        setEstimate(null);
        return;
      }
      setActiveRide((current) =>
        current ? { ...current, status: data.status, driver: data.driver } : current,
      );
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [activeRideId, activeRideStatus]);

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

  function handleSelectOrigin(result: AddressResult) {
    setOrigin(result.point);
    setOriginLabel(result.label);
    setIsEditingOrigin(false);
  }

  async function handleConfirmRide(): Promise<ConfirmResult> {
    if (!destination || !estimate) return { ok: false, reason: "error" };

    const response = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        origin,
        destination: destinationLabel ?? `${destination.lat},${destination.lng}`,
        estimatedPrice: estimate.estimatedPrice,
        distanceKm: estimate.distanceKm,
        etaMinutes: estimate.etaMinutes,
      }),
    });

    if (response.status === 409) {
      const data = await response.json().catch(() => null);
      if (data?.code === "active-ride-exists") {
        const activeResponse = await fetch("/api/rides/active");
        const active = activeResponse.ok ? await activeResponse.json() : null;
        if (active) {
          setActiveRide(active);
          return { ok: true };
        }
      }
      return { ok: false, reason: "no-driver" };
    }
    if (!response.ok) return { ok: false, reason: "error" };

    const data = await response.json();
    setActiveRide({
      id: data.id,
      status: data.status,
      destination: destinationLabel ?? "Destination",
      estimatedPrice: estimate.estimatedPrice,
      driver: data.driver,
    });
    return { ok: true };
  }

  function handleRideCancelled() {
    setActiveRide(null);
    setDestination(null);
    setDestinationLabel(null);
    setEstimate(null);
  }

  function handleNewRide() {
    setCompletedRide(null);
    setDestination(null);
    setDestinationLabel(null);
    setEstimate(null);
  }

  if (completedRide) {
    return <RideCompletedScreen ride={completedRide} onNewRide={handleNewRide} />;
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
        <div className="flex w-full max-w-md flex-col gap-2">
          {isEditingOrigin ? (
            <DestinationSearch
              key="origin-edit"
              onSelect={handleSelectOrigin}
              placeholder="Départ"
              ariaLabel="Modifier le point de départ"
              initialQuery={originLabel ?? ""}
              autoFocus
            />
          ) : (
            <button
              type="button"
              onClick={() => setIsEditingOrigin(true)}
              className="flex h-12 w-full cursor-pointer items-center gap-2 rounded-full bg-popover px-4 text-left text-sm text-foreground shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)] outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background sm:h-11"
            >
              <MapPinIcon aria-hidden="true" className="size-4.5 shrink-0 opacity-80" />
              <span className="truncate">{originLabel ?? "Localisation en cours…"}</span>
            </button>
          )}
          <DestinationSearch onSelect={handleSearchSelect} />
        </div>
        {usingFallbackCenter && (
          <p className="rounded-full bg-popover px-4 py-2 text-xs text-muted-foreground shadow-[0_8px_24px_oklch(0.17_0.01_90_/_0.16)]">
            Position approximative (Lomé)
          </p>
        )}
      </div>

      {activeRide ? (
        <ActiveRidePanel ride={activeRide} onCancelled={handleRideCancelled} />
      ) : (
        <>
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
              style={{
                paddingBottom: "max(1.5rem, calc(env(safe-area-inset-bottom) + 1rem))",
              }}
            >
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-muted-foreground">
                  Destination
                </span>
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
                  destinationLabel={destinationLabel}
                  estimate={estimate}
                  onConfirm={handleConfirmRide}
                />
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
