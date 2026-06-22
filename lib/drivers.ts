import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { normalizeTogoPhone } from "@/lib/customers";

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
  return prisma.ride.findMany({
    where: { driverId, status: { in: ["pending", "accepted"] } },
    include: { customer: true },
    orderBy: { createdAt: "asc" },
  });
}
