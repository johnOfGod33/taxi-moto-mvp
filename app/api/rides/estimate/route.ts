import { NextResponse } from "next/server";
import { z } from "zod";
import { estimateRide } from "@/lib/geo";

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

const estimateSchema = z.object({
  origin: coordinatesSchema,
  destination: coordinatesSchema,
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = estimateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const estimate = estimateRide(parsed.data.origin, parsed.data.destination);

  return NextResponse.json(estimate, { status: 200 });
}
