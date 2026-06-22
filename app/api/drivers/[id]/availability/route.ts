import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { setDriverAvailability } from "@/lib/drivers";
import { getSession } from "@/lib/session";

const availabilitySchema = z.object({
  available: z.boolean(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
});

export async function PATCH(
  request: Request,
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

  const body = await request.json().catch(() => null);
  const parsed = availabilitySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const { available, lat, lng } = parsed.data;
  const updated = await setDriverAvailability(
    id,
    available,
    lat !== undefined && lng !== undefined ? { lat, lng } : undefined,
  );

  return NextResponse.json({
    id: updated.id,
    available: updated.available,
    lat: updated.lat,
    lng: updated.lng,
  });
}
