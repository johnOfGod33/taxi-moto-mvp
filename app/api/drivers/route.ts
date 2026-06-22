import { NextResponse } from "next/server";
import { z } from "zod";
import { driverSchema, upsertDriver } from "@/lib/drivers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = driverSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const driver = await upsertDriver(parsed.data);

  return NextResponse.json(
    {
      id: driver.id,
      name: driver.name,
      phone: driver.phone,
      licensePlate: driver.licensePlate,
    },
    { status: 200 },
  );
}
