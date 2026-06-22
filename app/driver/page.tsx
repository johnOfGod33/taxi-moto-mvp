import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

// TODO(task 7 — docs/tasks.md): replace with the driver dashboard (availability toggle + ride requests).
export default async function DriverPage() {
  const session = await getSession();
  if (session?.role !== "driver") redirect("/driver/form");

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 text-center">
      <p className="text-base text-muted-foreground">
        Bonjour {session.name} — le tableau de bord arrive (tâche 7).
      </p>
    </main>
  );
}
