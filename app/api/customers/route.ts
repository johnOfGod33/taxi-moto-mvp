import { NextResponse } from "next/server";
import { z } from "zod";
import { customerSchema, upsertCustomer } from "@/lib/customers";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = customerSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: z.treeifyError(parsed.error) },
      { status: 400 },
    );
  }

  const customer = await upsertCustomer(parsed.data);

  return NextResponse.json(
    { id: customer.id, name: customer.name, phone: customer.phone },
    { status: 200 },
  );
}
