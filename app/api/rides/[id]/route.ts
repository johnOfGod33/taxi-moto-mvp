import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { applyRideAction, getRideById, RideActionError } from "@/lib/rides";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) {
    return NextResponse.json({ error: "Course introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    id: ride.id,
    status: ride.status,
    driver: ride.driver
      ? { name: ride.driver.name, licensePlate: ride.driver.licensePlate }
      : null,
  });
}

const patchSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("accept") }),
  z.object({ type: z.literal("decline") }),
  z.object({
    type: z.literal("complete"),
    paymentMethod: z.enum(["cash", "flooz", "tmoney"]),
  }),
]);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (session?.role !== "driver") {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const driver = await prisma.driver.findUnique({
    where: { phone: session.phone },
  });
  if (!driver) {
    return NextResponse.json({ error: "Conducteur introuvable." }, { status: 404 });
  }

  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { id } = await params;

  try {
    const ride = await applyRideAction(id, driver.id, parsed.data);
    if (!ride) {
      return NextResponse.json({ error: "Course introuvable." }, { status: 404 });
    }
    return NextResponse.json({ id: ride.id, status: ride.status });
  } catch (error) {
    if (error instanceof RideActionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    throw error;
  }
}
