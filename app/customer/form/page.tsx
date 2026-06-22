import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import { getSession } from "@/lib/session";
import { CustomerForm } from "./customer-form";

export default async function CustomerFormPage() {
  const session = await getSession();
  if (session?.role === "customer") redirect("/customer");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-8">
        <div className="flex w-full flex-col items-center gap-4 text-center">
          <Wordmark className="text-3xl sm:text-4xl" />
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-balance text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
              Quelques infos avant de réserver
            </h1>
            <p className="text-pretty text-base text-muted-foreground">
              Aucun compte à créer. On garde vos infos pour votre prochaine course.
            </p>
          </div>
        </div>

        <CustomerForm />

        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground underline-offset-4 hover:underline"
        >
          Retour
        </Link>
      </div>
    </main>
  );
}
