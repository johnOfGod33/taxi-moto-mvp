import { cookies } from "next/headers";

export const SESSION_COOKIE = "taxi-moto-session";

export type Role = "customer" | "driver";

export type Session = {
  role: Role;
  name: string;
  phone: string;
  licensePlate?: string;
};

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  if (v.role !== "customer" && v.role !== "driver") return false;
  if (typeof v.name !== "string" || typeof v.phone !== "string") return false;
  if (v.role === "driver" && typeof v.licensePlate !== "string") return false;
  return true;
}

export async function getSession(): Promise<Session | null> {
  const store = await cookies();
  const raw = store.get(SESSION_COOKIE)?.value;
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function setSession(session: Session): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
