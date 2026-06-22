import { prisma } from "@/lib/prisma";
import { haversineDistanceKm, MATCH_RADIUS_KM, type Coordinates } from "@/lib/geo";
import type { PaymentMethod } from "@/generated/prisma/enums";

// A ride is broadcast to every available driver within MATCH_RADIUS_KM rather
// than pre-assigned to the nearest one, so the first driver to accept gets it.
export async function hasAvailableDriverNearby(origin: Coordinates) {
  const availableDrivers = await prisma.driver.findMany({
    where: { available: true },
  });

  if (availableDrivers.length === 0) return false;

  const withLocation = availableDrivers.filter(
    (driver) => driver.lat !== null && driver.lng !== null,
  );

  // Drivers without a reported position yet (never toggled "disponible" with
  // geolocation granted) fall back to always-eligible instead of failing the match.
  if (withLocation.length === 0) return true;

  return withLocation.some(
    (driver) =>
      haversineDistanceKm(origin, {
        lat: driver.lat as number,
        lng: driver.lng as number,
      }) <= MATCH_RADIUS_KM,
  );
}

export async function createRide(input: {
  customerId: string;
  origin: Coordinates;
  destination: string;
  estimatedPrice: number;
  distanceKm: number;
  etaMinutes: number;
}) {
  return prisma.ride.create({
    data: {
      customerId: input.customerId,
      originLat: input.origin.lat,
      originLng: input.origin.lng,
      destination: input.destination,
      estimatedPrice: input.estimatedPrice,
      distanceKm: input.distanceKm,
      etaMinutes: input.etaMinutes,
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

export async function getActiveRideForCustomer(customerId: string) {
  return prisma.ride.findFirst({
    where: { customerId, status: { in: ["pending", "accepted", "in_progress"] } },
    include: { driver: true },
    orderBy: { createdAt: "desc" },
  });
}

export type DriverRideAction =
  | { type: "accept" }
  | { type: "decline" }
  | { type: "start" }
  | { type: "complete"; paymentMethod: PaymentMethod };

export class RideActionError extends Error {}

export async function applyDriverRideAction(
  rideId: string,
  driverId: string,
  action: DriverRideAction,
) {
  if (action.type === "accept") {
    // Atomic claim: only succeeds if the ride is still unassigned and pending,
    // so the first driver to accept wins even if several requested it at once.
    const claimed = await prisma.ride.updateMany({
      where: { id: rideId, status: "pending", driverId: null },
      data: { driverId, status: "accepted" },
    });
    if (claimed.count === 0) {
      const ride = await prisma.ride.findUnique({ where: { id: rideId } });
      if (!ride) return null;
      throw new RideActionError("Cette course a déjà été prise par un autre conducteur.");
    }
    return prisma.ride.findUnique({ where: { id: rideId }, include: { driver: true } });
  }

  if (action.type === "decline") {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride) return null;
    if (ride.status !== "pending") {
      throw new RideActionError("La course n'est plus en attente.");
    }
    return prisma.ride.update({
      where: { id: rideId },
      data: { declinedDriverIds: { push: driverId } },
    });
  }

  if (action.type === "start") {
    const ride = await prisma.ride.findUnique({ where: { id: rideId } });
    if (!ride || ride.driverId !== driverId) return null;
    if (ride.status !== "accepted") {
      throw new RideActionError("La course doit être acceptée avant de démarrer.");
    }
    return prisma.ride.update({
      where: { id: rideId },
      data: { status: "in_progress" },
    });
  }

  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.driverId !== driverId) return null;
  if (ride.status !== "in_progress") {
    throw new RideActionError("La course doit être démarrée avant d'être terminée.");
  }
  return prisma.ride.update({
    where: { id: rideId },
    data: { status: "completed", paymentMethod: action.paymentMethod },
  });
}

export async function cancelRideAsCustomer(rideId: string, customerId: string) {
  const ride = await prisma.ride.findUnique({ where: { id: rideId } });
  if (!ride || ride.customerId !== customerId) return null;

  if (ride.status !== "pending" && ride.status !== "accepted") {
    throw new RideActionError("Cette course ne peut plus être annulée.");
  }

  return prisma.ride.update({
    where: { id: rideId },
    data: { status: "cancelled" },
  });
}
