import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDriverRides } from "@/lib/drivers";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session?.role !== "driver") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver || driver.phone !== session.phone) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 403 });
  }

  const rides = await getDriverRides(id);

  return NextResponse.json(
    rides.map((ride) => ({
      id: ride.id,
      status: ride.status,
      destination: ride.destination,
      estimatedPrice: ride.estimatedPrice,
      pickupEtaMinutes: ride.pickupEtaMinutes,
      customer: { name: ride.customer.name, phone: ride.customer.phone },
    })),
  );
}
