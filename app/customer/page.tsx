import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// TODO(task 5 — docs/tasks.md): replace with the map + destination booking screen.
export default async function CustomerPage() {
  const session = await getSession();
  if (session?.role !== "customer") redirect("/customer/form");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <p className="text-base text-muted-foreground">
        Bonjour {session.name} — la carte de réservation arrive (tâche 5).
      </p>
    </main>
  );
}
