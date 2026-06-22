import { prisma } from "@/lib/prisma";
import { haversineDistanceKm, type Coordinates } from "@/lib/geo";
import type { PaymentMethod } from "@/generated/prisma/enums";

export async function findNearestAvailableDriver(origin: Coordinates) {
  const availableDrivers = await prisma.driver.findMany({
    where: { available: true },
  });

  if (availableDrivers.length === 0) return null;

  const withLocation = availableDrivers.filter(
    (driver) => driver.lat !== null && driver.lng !== null,
  );

  // Drivers without a reported position yet (never toggled "disponible" with
  // geolocation granted) fall back to first-available instead of failing the match.
  if (withLocation.length === 0) return availableDrivers[0];

  return withLocation.reduce((nearest, driver) => {
    const driverDistance = haversineDistanceKm(origin, {
      lat: driver.lat as number,
      lng: driver.lng as number,
    });
    const nearestDistance = haversineDistanceKm(origin, {
      lat: nearest.lat as number,
      lng: nearest.lng as number,
    });
    return driverDistance < nearestDistance ? driver : nearest;
  });
}

export async function createRide(input: {
  customerId: string;
  driverId: string | null;
  destination: string;
  estimatedPrice: number;
}) {
  return prisma.ride.create({
    data: {
      customerId: input.customerId,
      driverId: input.driverId,
      destination: input.destination,
      estimatedPrice: input.estimatedPrice,
    },
    include: { driver: true },
  });
}

export async function getRideById(id: string) {
  return prisma.ride.findUnique({
    where: { id },
    include: { driver: true },
  });
}

export type RideAction =
  | { type: "accept" }
  | { type: "decline" }
  | { type: "complete"; paymentMethod: PaymentMethod };

export class RideActionError extends Error {}

export async function applyRideAction(
  rideId: string,
  driverId: string,
  action: RideAction,
) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.driverId !== driverId) return null;

  if (action.type === "accept" || action.type === "decline") {
    if (ride.status !== "pending") {
      throw new RideActionError("La course n'est plus en attente.");
    }
    return prisma.ride.update({
      where: { id: rideId },
      data: { status: action.type === "accept" ? "accepted" : "declined" },
    });
  }

  if (ride.status !== "accepted") {
    throw new RideActionError("La course doit être acceptée avant d'être terminée.");
  }
  return prisma.ride.update({
    where: { id: rideId },
    data: { status: "completed", paymentMethod: action.paymentMethod },
  });
}
