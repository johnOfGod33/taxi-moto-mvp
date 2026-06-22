"use client";

import { ArrowRightIcon } from "lucide-react";
import { useState } from "react";
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
import type { RideEstimate } from "@/lib/geo";

export type ConfirmResult = { ok: true } | { ok: false; reason: "no-driver" | "error" };

type Phase = "idle" | "searching" | "no-driver" | "error";

export function ConfirmRideDialog({
  destinationLabel,
  estimate,
  onConfirm,
}: {
  destinationLabel: string | null;
  estimate: RideEstimate;
  onConfirm: () => Promise<ConfirmResult>;
}) {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");

  async function handleSearchDriver() {
    setPhase("searching");
    const result = await onConfirm();
    if (result.ok) {
      setOpen(false);
      setPhase("idle");
      return;
    }
    setPhase(result.reason);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setPhase("idle");
      }}
    >
      <DialogTrigger render={<Button size="lg" className="w-full" />}>
        Commander pour {estimate.estimatedPrice} FCFA
        <ArrowRightIcon aria-hidden="true" />
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

          {phase === "searching" && (
            <p className="text-sm text-muted-foreground">Recherche d&apos;un conducteur…</p>
          )}
          {phase === "no-driver" && (
            <p className="text-sm text-destructive">
              Aucun conducteur disponible pour le moment. Réessayez dans un instant.
            </p>
          )}
          {phase === "error" && (
            <p className="text-sm text-destructive">Une erreur est survenue. Réessayez.</p>
          )}
        </DialogPanel>
        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Annuler</DialogClose>
          <Button onClick={handleSearchDriver} loading={phase === "searching"}>
            Rechercher un conducteur
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
