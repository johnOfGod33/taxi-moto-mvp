"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { driverSchema, upsertDriver } from "@/lib/drivers";
import { setSession } from "@/lib/session";

export type DriverFormState = {
  errors: { name?: string; phone?: string; licensePlate?: string };
  values: { name: string; phone: string; licensePlate: string };
};

export async function submitDriverForm(
  _prevState: DriverFormState,
  formData: FormData,
): Promise<DriverFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    licensePlate: String(formData.get("licensePlate") ?? ""),
  };

  const parsed = driverSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return {
      errors: {
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
        licensePlate: fieldErrors.licensePlate?.[0],
      },
      values,
    };
  }

  const driver = await upsertDriver(parsed.data);
  await setSession({
    role: "driver",
    name: driver.name,
    phone: driver.phone,
    licensePlate: driver.licensePlate,
  });
  redirect("/driver");
}
