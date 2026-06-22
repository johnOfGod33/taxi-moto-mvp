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
