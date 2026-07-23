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

/**
 * Approx distance in km from a point P to the line segment A->B, using an
 * equirectangular projection around A. Good enough for city-scale route matching
 * (a few km error at worst); avoids pulling in PostGIS/turf.
 */
export function pointToSegmentKm(
  p: { lat: number; lng: number },
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371;
  const cosLat = Math.cos(toRad(a.lat));
  const project = (q: { lat: number; lng: number }) => ({
    x: R * toRad(q.lng - a.lng) * cosLat,
    y: R * toRad(q.lat - a.lat),
  });
  const A = { x: 0, y: 0 };
  const B = project(b);
  const P = project(p);
  const dx = B.x - A.x;
  const dy = B.y - A.y;
  const len2 = dx * dx + dy * dy;
  let t = len2 === 0 ? 0 : ((P.x - A.x) * dx + (P.y - A.y) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = A.x + t * dx;
  const cy = A.y + t * dy;
  return Math.hypot(P.x - cx, P.y - cy);
}

