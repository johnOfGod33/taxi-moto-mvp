import { z } from "zod";
import { prisma } from "@/lib/prisma";

export function normalizeTogoPhone(raw: string): string {
  return raw.replace(/[\s.-]/g, "").replace(/^\+228/, "").replace(/^228/, "");
}

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Le nom doit contenir au moins 2 caractères."),
  phone: z
    .string()
    .trim()
    .refine((value) => /^[0-9]{8}$/.test(normalizeTogoPhone(value)), {
      message: "Numéro togolais invalide (8 chiffres, ex : 90 12 34 56).",
    }),
});

export type CustomerInput = z.infer<typeof customerSchema>;

export async function upsertCustomer(input: CustomerInput) {
  const phone = normalizeTogoPhone(input.phone);

  return prisma.customer.upsert({
    where: { phone },
    create: { name: input.name, phone },
    update: { name: input.name },
  });
}
