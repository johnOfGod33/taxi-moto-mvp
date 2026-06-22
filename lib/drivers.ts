import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeTogoPhone } from "@/lib/customers";
import { AVERAGE_SPEED_KMH, haversineDistanceKm, MATCH_RADIUS_KM } from "@/lib/geo";

export const driverSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  phone: z
    .string()
    .trim()
    .refine((value) => /^[0-9]{8}$/.test(normalizeTogoPhone(value)), {
      message: "Numéro togolais invalide (8 chiffres, ex : 90 12 34 56).",
    }),
  licensePlate: z
    .string()
    .trim()
    .min(4, "Plaque invalide (au moins 4 caractères).")
    .transform((value) => value.toUpperCase()),
});

export type DriverInput = z.infer<typeof driverSchema>;

export async function upsertDriver(input: DriverInput) {
  const phone = normalizeTogoPhone(input.phone);

  return prisma.driver.upsert({
    where: { phone },
    create: { name: input.name, phone, licensePlate: input.licensePlate },
    update: { name: input.name, licensePlate: input.licensePlate },
  });
}

export async function getDriverByPhone(phone: string) {
  return prisma.driver.findUnique({ where: { phone } });
}

export async function setDriverAvailability(
  id: string,
  available: boolean,
  location?: { lat: number; lng: number },
) {
  return prisma.driver.update({
    where: { id },
    data: {
      available,
      ...(location && { lat: location.lat, lng: location.lng }),
    },
  });
}

export async function getDriverRides(driverId: string) {
  const driver = await prisma.driver.findUnique({ where: { id: driverId } });
  if (!driver) return [];

  const [ownAcceptedRides, pendingRides] = await Promise.all([
    prisma.ride.findMany({
      where: { driverId, status: "accepted" },
      include: { customer: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.ride.findMany({
      where: {
        status: "pending",
        driverId: null,
        NOT: { declinedDriverIds: { has: driverId } },
      },
      include: { customer: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  // Broadcast pending requests, filtered to this driver's vicinity — unless
  // the driver hasn't reported a location yet, in which case show all of them.
  const nearbyPendingRides =
    driver.lat === null || driver.lng === null
      ? pendingRides
      : pendingRides.filter((ride) => {
          if (ride.originLat === null || ride.originLng === null) return true;
          return (
            haversineDistanceKm(
              { lat: driver.lat as number, lng: driver.lng as number },
              { lat: ride.originLat, lng: ride.originLng },
            ) <= MATCH_RADIUS_KM
          );
        });

  const driverLat = driver.lat;
  const driverLng = driver.lng;

  function pickupEtaMinutes(ride: { originLat: number | null; originLng: number | null }) {
    if (driverLat === null || driverLng === null) return null;
    if (ride.originLat === null || ride.originLng === null) return null;
    const distanceKm = haversineDistanceKm(
      { lat: driverLat, lng: driverLng },
      { lat: ride.originLat, lng: ride.originLng },
    );
    return Math.max(1, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));
  }

  return [...nearbyPendingRides, ...ownAcceptedRides].map((ride) => ({
    ...ride,
    pickupEtaMinutes: pickupEtaMinutes(ride),
  }));
}
