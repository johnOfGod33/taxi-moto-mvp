import { NextResponse } from "next/server";
import { getRideById } from "@/lib/rides";
import { getSession } from "@/lib/session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }

  const { id } = await params;
  const ride = await getRideById(id);
  if (!ride) {
    return NextResponse.json({ error: "Course introuvable." }, { status: 404 });
  }

  return NextResponse.json({
    id: ride.id,
    status: ride.status,
    driver: ride.driver
      ? { name: ride.driver.name, licensePlate: ride.driver.licensePlate }
      : null,
  });
}
