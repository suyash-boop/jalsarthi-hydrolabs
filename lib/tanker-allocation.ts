import type { Tanker, AllocationRecommendation } from "./types";

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function scoreTankerForVillage(
  tanker: Tanker,
  villageLat: number,
  villageLng: number,
  sourceLat?: number,
  sourceLng?: number
): AllocationRecommendation {
  const originLat = sourceLat ?? tanker.depotLat;
  const originLng = sourceLng ?? tanker.depotLng;

  const distance = calculateDistance(
    originLat,
    originLng,
    villageLat,
    villageLng
  );
  const estimatedTime = Math.round((distance / 40) * 60); // 40 km/h avg

  // Proximity score: closer is better, max 100km range
  const proximityScore = Math.max(0, 100 - (distance / 100) * 100);

  // Capacity score: larger is better, normalized to 15000L
  const capacityScore = Math.min(100, (tanker.capacity / 15000) * 100);

  // Availability score
  const statusScore = tanker.status === "available" ? 100 : 0;

  const score = Math.round(
    proximityScore * 0.6 + capacityScore * 0.2 + statusScore * 0.2
  );

  return {
    tankerId: tanker.id,
    tanker,
    distance: Math.round(distance * 10) / 10,
    estimatedTime,
    score,
  };
}

export function recommendTankers(
  tankers: Tanker[],
  villageLat: number,
  villageLng: number,
  sourceLat?: number,
  sourceLng?: number,
  limit: number = 5
): AllocationRecommendation[] {
  return tankers
    .filter((t) => t.status === "available")
    .map((t) =>
      scoreTankerForVillage(t, villageLat, villageLng, sourceLat, sourceLng)
    )
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
