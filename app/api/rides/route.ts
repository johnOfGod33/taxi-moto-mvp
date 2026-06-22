import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  createRide,
  getActiveRideForCustomer,
  hasAvailableDriverNearby,
} from "@/lib/rides";
import { getSession } from "@/lib/session";

const createRideSchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  originLabel: z.string().trim().min(1).optional(),
  destination: z.string().trim().min(1),
  estimatedPrice: z.number().nonnegative(),
  distanceKm: z.number().nonnegative(),
  etaMinutes: z.number().nonnegative(),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (session?.role !== "customer") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const customer = await prisma.customer.findUnique({
    where: { phone: session.phone },
  });
  if (!customer) {
    return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
  }

  const activeRide = await getActiveRideForCustomer(customer.id);
  if (activeRide) {
    return NextResponse.json(
      { error: "Une course est déjà en cours.", code: "active-ride-exists" },
      { status: 409 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = createRideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const hasDriverNearby = await hasAvailableDriverNearby(parsed.data.origin);
  if (!hasDriverNearby) {
    return NextResponse.json(
      { error: "Aucun conducteur disponible pour le moment." },
      { status: 409 },
    );
  }

  const ride = await createRide({
    customerId: customer.id,
    origin: parsed.data.origin,
    originLabel: parsed.data.originLabel,
    destination: parsed.data.destination,
    estimatedPrice: parsed.data.estimatedPrice,
    distanceKm: parsed.data.distanceKm,
    etaMinutes: parsed.data.etaMinutes,
  });

  return NextResponse.json(
    { id: ride.id, status: ride.status, driver: null },
    { status: 201 },
  );
}
