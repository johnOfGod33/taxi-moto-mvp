import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  applyDriverRideAction,
  cancelRideAsCustomer,
  getRideById,
  RideActionError,
} from "@/lib/rides";
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
    originLabel: ride.originLabel,
    destination: ride.destination,
    estimatedPrice: ride.estimatedPrice,
    distanceKm: ride.distanceKm,
    etaMinutes: ride.etaMinutes,
    paymentMethod: ride.paymentMethod,
    driver: ride.driver
      ? {
          name: ride.driver.name,
          licensePlate: ride.driver.licensePlate,
          phone: ride.driver.phone,
        }
      : null,
  });
}

const driverActionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("accept") }),
  z.object({ type: z.literal("decline") }),
  z.object({ type: z.literal("start") }),
  z.object({
    type: z.literal("complete"),
    paymentMethod: z.enum(["cash", "flooz", "tmoney"]),
  }),
]);

const customerActionSchema = z.object({ type: z.literal("cancel") });

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  try {
    if (session.role === "driver") {
      const driver = await prisma.driver.findUnique({
        where: { phone: session.phone },
      });
      if (!driver) {
        return NextResponse.json({ error: "Conducteur introuvable." }, { status: 404 });
      }

      const parsed = driverActionSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json(
          { error: z.treeifyError(parsed.error) },
          { status: 400 },
        );
      }

      const ride = await applyDriverRideAction(id, driver.id, parsed.data);
      if (!ride) {
        return NextResponse.json({ error: "Course introuvable." }, { status: 404 });
      }
      return NextResponse.json({ id: ride.id, status: ride.status });
    }

    const customer = await prisma.customer.findUnique({
      where: { phone: session.phone },
    });
    if (!customer) {
      return NextResponse.json({ error: "Client introuvable." }, { status: 404 });
    }

    const parsed = customerActionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: z.treeifyError(parsed.error) },
        { status: 400 },
      );
    }

    const ride = await cancelRideAsCustomer(id, customer.id);
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
