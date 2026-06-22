import { prisma } from "@/lib/prisma";
import { haversineDistanceKm, type Coordinates } from "@/lib/geo";

export async function findNearestAvailableDriver(origin: Coordinates) {
  const availableDrivers = await prisma.driver.findMany({
    where: { available: true },
  });

  if (availableDrivers.length === 0) return null;

  const withLocation = availableDrivers.filter(
    (driver) => driver.lat !== null && driver.lng !== null,
  );

  // Until drivers report a live position (task 7), fall back to the first
  // available driver instead of failing the match.
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
