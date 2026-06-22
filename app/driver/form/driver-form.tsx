"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { submitDriverForm, type DriverFormState } from "./actions";

const initialState: DriverFormState = {
  errors: {},
  values: { name: "", phone: "", licensePlate: "" },
};

export function DriverForm() {
  const [state, formAction, isPending] = useActionState(
    submitDriverForm,
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

      <Field name="licensePlate">
        <FieldLabel>Plaque du véhicule</FieldLabel>
        <Input
          type="text"
          name="licensePlate"
          placeholder="TG 1234 AB"
          defaultValue={state.values.licensePlate}
          aria-invalid={state.errors.licensePlate ? true : undefined}
          required
          size="lg"
        />
        {state.errors.licensePlate && (
          <FieldError>{state.errors.licensePlate}</FieldError>
        )}
      </Field>

      <Button type="submit" size="lg" className="w-full" loading={isPending}>
        Continuer
      </Button>
    </Form>
  );
}
