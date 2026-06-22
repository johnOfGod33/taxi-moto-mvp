import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveRideForCustomer } from "@/lib/rides";
import { getSession } from "@/lib/session";

export async function GET() {
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

  const ride = await getActiveRideForCustomer(customer.id);
  if (!ride) return NextResponse.json(null);

  return NextResponse.json({
    id: ride.id,
    status: ride.status,
    destination: ride.destination,
    estimatedPrice: ride.estimatedPrice,
    driver: ride.driver
      ? { name: ride.driver.name, licensePlate: ride.driver.licensePlate }
      : null,
  });
}
