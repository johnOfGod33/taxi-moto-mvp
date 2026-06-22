"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { customerSchema, upsertCustomer } from "@/lib/customers";
import { setSession } from "@/lib/session";

export type CustomerFormState = {
  errors: { name?: string; phone?: string };
  values: { name: string; phone: string };
};

export async function submitCustomerForm(
  _prevState: CustomerFormState,
  formData: FormData,
): Promise<CustomerFormState> {
  const values = {
    name: String(formData.get("name") ?? ""),
    phone: String(formData.get("phone") ?? ""),
  };

  const parsed = customerSchema.safeParse(values);

  if (!parsed.success) {
    const fieldErrors = z.flattenError(parsed.error).fieldErrors;
    return {
      errors: {
        name: fieldErrors.name?.[0],
        phone: fieldErrors.phone?.[0],
      },
      values,
    };
  }

  const customer = await upsertCustomer(parsed.data);
  await setSession({ role: "customer", name: customer.name, phone: customer.phone });
  redirect("/customer");
}
