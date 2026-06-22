import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { createRide, findNearestAvailableDriver } from "@/lib/rides";
import { getSession } from "@/lib/session";

const createRideSchema = z.object({
  origin: z.object({ lat: z.number(), lng: z.number() }),
  destination: z.string().trim().min(1),
  estimatedPrice: z.number().nonnegative(),
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

  const body = await request.json().catch(() => null);
  const parsed = createRideSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const driver = await findNearestAvailableDriver(parsed.data.origin);
  if (!driver) {
    return NextResponse.json(
      { error: "Aucun conducteur disponible pour le moment." },
      { status: 409 },
    );
  }

  const ride = await createRide({
    customerId: customer.id,
    driverId: driver.id,
    destination: parsed.data.destination,
    estimatedPrice: parsed.data.estimatedPrice,
  });

  return NextResponse.json(
    {
      id: ride.id,
      status: ride.status,
      driver: ride.driver
        ? { name: ride.driver.name, licensePlate: ride.driver.licensePlate }
        : null,
    },
    { status: 201 },
  );
}
