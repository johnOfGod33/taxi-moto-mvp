"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { submitCustomerForm, type CustomerFormState } from "./actions";

const initialState: CustomerFormState = {
  errors: {},
  values: { name: "", phone: "" },
};

export function CustomerForm() {
  const [state, formAction, isPending] = useActionState(
    submitCustomerForm,
    initialState,
  );

  return (
    <Form action={formAction} className="flex w-full flex-col gap-5">
      <Field name="name">
        <FieldLabel>Nom</FieldLabel>
        <Input
          type="text"
          name="name"
          placeholder="Votre nom"
          defaultValue={state.values.name}
          aria-invalid={state.errors.name ? true : undefined}
          required
          size="lg"
        />
        {state.errors.name && <FieldError>{state.errors.name}</FieldError>}
      </Field>

      <Field name="phone">
        <FieldLabel>Numéro de téléphone</FieldLabel>
        <Input
          type="tel"
          name="phone"
          placeholder="90 12 34 56"
          defaultValue={state.values.phone}
          aria-invalid={state.errors.phone ? true : undefined}
          required
          size="lg"
        />
        {state.errors.phone && <FieldError>{state.errors.phone}</FieldError>}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={isPending}>
        Continuer
      </Button>
    </Form>
  );
}
