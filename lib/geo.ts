export type Coordinates = { lat: number; lng: number };

const EARTH_RADIUS_KM = 6371;

// Lomé city center — used as the default map view when geolocation is unavailable/denied.
export const DEFAULT_CENTER: Coordinates = { lat: 6.1319, lng: 1.2228 };

// MVP pricing assumptions (FCFA) — adjust once real fare data is available.
export const BASE_FARE_FCFA = 200;
export const RATE_PER_KM_FCFA = 150;
export const AVERAGE_SPEED_KMH = 25;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

export function haversineDistanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h =
    sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export type RideEstimate = {
  distanceKm: number;
  estimatedPrice: number;
  etaMinutes: number;
};

export function estimateRide(origin: Coordinates, destination: Coordinates): RideEstimate {
  const distanceKm = haversineDistanceKm(origin, destination);
  const estimatedPrice = Math.round(BASE_FARE_FCFA + RATE_PER_KM_FCFA * distanceKm);
  const etaMinutes = Math.max(1, Math.round((distanceKm / AVERAGE_SPEED_KMH) * 60));

  return { distanceKm, estimatedPrice, etaMinutes };
}

export type AddressResult = { label: string; point: Coordinates };

export async function searchAddress(query: string): Promise<AddressResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "tg");

    const response = await fetch(url, {
      headers: { "Accept-Language": "fr" },
    });
    if (!response.ok) return [];

    const data = await response.json();
    if (!Array.isArray(data)) return [];

    return data
      .filter((item) => typeof item?.display_name === "string" && item?.lat && item?.lon)
      .map((item) => ({
        label: item.display_name as string,
        point: { lat: Number(item.lat), lng: Number(item.lon) },
      }));
  } catch {
    return [];
  }
}

export async function reverseGeocode(point: Coordinates): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("lat", String(point.lat));
    url.searchParams.set("lon", String(point.lng));
    url.searchParams.set("format", "jsonv2");

    const response = await fetch(url, {
      headers: { "Accept-Language": "fr" },
    });
    if (!response.ok) return null;

    const data = await response.json();
    return typeof data?.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}
