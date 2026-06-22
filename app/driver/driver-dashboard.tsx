"use client";

import { useEffect, useId, useRef, useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Radio, RadioGroup } from "@/components/ui/radio-group";
import { StatusPill } from "@/components/ui/status-pill";
import { Switch } from "@/components/ui/switch";
import { Wordmark } from "@/components/wordmark";

type RideStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "declined"
  | "cancelled"
  | "completed";
type PaymentMethod = "cash" | "flooz" | "tmoney";

type DriverRide = {
  id: string;
  status: RideStatus;
  destination: string;
  estimatedPrice: number;
  pickupEtaMinutes: number | null;
  customer: { name: string; phone: string };
};

const POLL_INTERVAL_MS = 5000;

export function DriverDashboard({
  driverId,
  driverName,
  licensePlate,
  initialAvailable,
  initialRides,
}: {
  driverId: string;
  driverName: string;
  licensePlate: string;
  initialAvailable: boolean;
  initialRides: DriverRide[];
}) {
  const [available, setAvailable] = useState(initialAvailable);
  const [rides, setRides] = useState<DriverRide[]>(initialRides);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const switchId = useId();

  const refreshRides = useRef(async () => {
    const response = await fetch(`/api/drivers/${driverId}/rides`);
    if (response.ok) setRides(await response.json());
  });

  useEffect(() => {
    const interval = setInterval(() => {
      refreshRides.current();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  async function handleToggleAvailability(next: boolean) {
    setAvailable(next);

    let location: { lat: number; lng: number } | undefined;
    if (next && typeof navigator !== "undefined" && navigator.geolocation) {
      location = await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) =>
            resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
          () => resolve(undefined),
          { enableHighAccuracy: true, timeout: 8000 },
        );
      });
    }

    await fetch(`/api/drivers/${driverId}/availability`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ available: next, ...location }),
    });
  }

  async function handleRideAction(rideId: string, type: "accept" | "decline" | "start") {
    setPendingActionId(rideId);
    const response = await fetch(`/api/rides/${rideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    });
    if (response.ok) await refreshRides.current();
    setPendingActionId(null);
  }

  async function handleComplete(rideId: string, paymentMethod: PaymentMethod) {
    const response = await fetch(`/api/rides/${rideId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "complete", paymentMethod }),
    });
    if (response.ok) await refreshRides.current();
  }

  const pendingRides = rides.filter((ride) => ride.status === "pending");
  const acceptedRides = rides.filter(
    (ride) => ride.status === "accepted" || ride.status === "in_progress",
  );

  return (
    <div className="flex flex-1 flex-col sm:flex-row">
      <aside
        className="flex flex-col gap-5 bg-primary px-6 py-6 sm:w-64 sm:shrink-0 sm:py-8"
        style={{
          paddingTop: "max(1.5rem, calc(env(safe-area-inset-top) + 1rem))",
        }}
      >
        <Wordmark className="text-primary-foreground" />

        <div className="flex flex-col gap-1">
          <span className="text-lg font-semibold tracking-[-0.02em] text-primary-foreground">
            {driverName}
          </span>
          <span className="text-sm text-primary-foreground/72">{licensePlate}</span>
        </div>

        <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-start sm:gap-3">
          <Label htmlFor={switchId}>
            <StatusPill variant={available ? "go" : "neutral"}>
              {available ? "Disponible" : "Indisponible"}
            </StatusPill>
          </Label>
          <Switch
            id={switchId}
            checked={available}
            onCheckedChange={handleToggleAvailability}
            className="data-unchecked:bg-primary-foreground/35 data-checked:bg-primary-foreground"
          />
        </div>
      </aside>

      <main
        className="flex flex-1 flex-col gap-6 bg-background px-6 py-6"
        style={{
          paddingBottom: "max(2rem, calc(env(safe-area-inset-bottom) + 1rem))",
        }}
      >
        <span className="text-xl font-semibold tracking-[-0.02em] text-foreground">
          Bonjour {driverName.split(" ")[0]}
        </span>

        {acceptedRides.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
              Course en cours
            </h2>
            {acceptedRides.map((ride) => (
              <RideCard
                key={ride.id}
                ride={ride}
                isStarting={pendingActionId === ride.id}
                onStart={() => handleRideAction(ride.id, "start")}
                onComplete={handleComplete}
              />
            ))}
          </section>
        )}

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-semibold tracking-[-0.02em] text-foreground">
            Demandes à proximité
          </h2>
          {pendingRides.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Aucune demande pour le moment.
            </p>
          )}
          {pendingRides.map((ride) => (
            <div
              key={ride.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4"
            >
              <div className="flex flex-col gap-1">
                <span className="text-base font-medium text-foreground">
                  {ride.customer.name}
                </span>
                <span className="text-sm text-muted-foreground">{ride.destination}</span>
                {ride.pickupEtaMinutes !== null && (
                  <span className="text-sm text-muted-foreground">
                    ~{ride.pickupEtaMinutes} min jusqu&apos;au client
                  </span>
                )}
                <span className="text-base font-semibold text-foreground">
                  {ride.estimatedPrice} FCFA
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  disabled={pendingActionId === ride.id}
                  onClick={() => handleRideAction(ride.id, "decline")}
                >
                  Refuser
                </Button>
                <Button
                  className="flex-1"
                  disabled={pendingActionId === ride.id}
                  onClick={() => handleRideAction(ride.id, "accept")}
                >
                  Accepter
                </Button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function RideCard({
  ride,
  isStarting,
  onStart,
  onComplete,
}: {
  ride: DriverRide;
  isStarting: boolean;
  onStart: () => void;
  onComplete: (rideId: string, paymentMethod: PaymentMethod) => Promise<void>;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <StatusPill variant="go" className="self-start">
        {ride.status === "in_progress" ? "Course en cours" : "Acceptée"}
      </StatusPill>
      <div className="flex flex-col gap-1">
        <span className="text-base font-medium text-foreground">{ride.customer.name}</span>
        <span className="text-sm text-muted-foreground">{ride.destination}</span>
        <span className="text-base font-semibold text-foreground">
          {ride.estimatedPrice} FCFA
        </span>
      </div>
      {ride.status === "accepted" ? (
        <Button className="w-full" loading={isStarting} onClick={onStart}>
          Démarrer la course
        </Button>
      ) : (
        <Dialog>
          <DialogTrigger render={<Button className="w-full" />}>
            Terminer la course
          </DialogTrigger>
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Terminer la course</DialogTitle>
              <DialogDescription>Choisissez le mode de paiement.</DialogDescription>
            </DialogHeader>
            <DialogPanel>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <Label className="flex items-center gap-3 py-2.5">
                  <Radio value="cash" /> Cash
                </Label>
                <Label className="flex items-center gap-3 py-2.5">
                  <Radio value="flooz" /> Flooz
                </Label>
                <Label className="flex items-center gap-3 py-2.5">
                  <Radio value="tmoney" /> T-Money
                </Label>
              </RadioGroup>
            </DialogPanel>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
              <DialogClose
                render={<Button />}
                onClick={() => onComplete(ride.id, paymentMethod)}
              >
                Confirmer le paiement
              </DialogClose>
            </DialogFooter>
          </DialogPopup>
        </Dialog>
      )}
    </div>
  );
}
