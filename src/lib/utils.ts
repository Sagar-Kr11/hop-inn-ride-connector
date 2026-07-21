import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Haversine distance in km between two lat/lng points. */
export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

/**
 * Simple fare estimate for Hop-Inn.
 * - Solo: base ₹15 + ₹3/km
 * - Shared (route/event): same total split across expected co-passengers (default 3)
 */
export function estimateFare(
  distanceKm: number,
  rideType: "solo" | "shared_route" | "shared_event",
  expectedPassengers = 3,
): number {
  const base = 15;
  const perKm = 3;
  const total = base + Math.max(0, distanceKm) * perKm;
  if (rideType === "solo") return Math.round(total);
  const share = total / Math.max(1, expectedPassengers);
  return Math.max(10, Math.round(share));
}
