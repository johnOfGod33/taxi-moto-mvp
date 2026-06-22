import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wordmark } from "@/components/wordmark";
import { getSession } from "@/lib/session";

export default async function Home() {
  const session = await getSession();

  if (session?.role === "customer") redirect("/customer");
  if (session?.role === "driver") redirect("/driver");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center gap-10 text-center">
        <div className="flex flex-col items-center gap-3">
          <Wordmark />
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.02em] text-foreground sm:text-4xl">
            Votre taxi-moto en quelques secondes.
          </h1>
          <p className="text-pretty text-base text-muted-foreground">
            Choisissez votre profil pour continuer. Pas de compte, pas d&apos;attente.
          </p>
        </div>

        <div className="flex w-full flex-col gap-3">
          <Button render={<Link href="/customer/form" />} size="lg" className="w-full">
            Je suis client
          </Button>
          <Button
            render={<Link href="/driver/form" />}
            variant="secondary"
            size="lg"
            className="w-full"
          >
            Je suis conducteur
          </Button>
        </div>
      </div>
    </main>
  );
}
