import { redirect } from "next/navigation";
import { getDriverByPhone, getDriverRides } from "@/lib/drivers";
import { getSession } from "@/lib/session";
import { DriverDashboard } from "./driver-dashboard";

export default async function DriverPage() {
  const session = await getSession();
  if (session?.role !== "driver") redirect("/driver/form");

  const driver = await getDriverByPhone(session.phone);
  if (!driver) redirect("/driver/form");

  const rides = await getDriverRides(driver.id);

  return (
    <DriverDashboard
      driverId={driver.id}
      driverName={driver.name}
      licensePlate={driver.licensePlate}
      initialAvailable={driver.available}
      initialRides={rides.map((ride) => ({
        id: ride.id,
        status: ride.status,
        destination: ride.destination,
        estimatedPrice: ride.estimatedPrice,
        pickupEtaMinutes: ride.pickupEtaMinutes,
        customer: { name: ride.customer.name, phone: ride.customer.phone },
      }))}
    />
  );
}
