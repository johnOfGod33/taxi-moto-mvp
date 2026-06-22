import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { CustomerBookingScreen } from "./customer-booking-screen";

export default async function CustomerPage() {
  const session = await getSession();
  if (session?.role !== "customer") redirect("/customer/form");

  return <CustomerBookingScreen />;
}
