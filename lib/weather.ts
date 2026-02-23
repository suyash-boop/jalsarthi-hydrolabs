interface DailyWeatherResponse {
  daily: {
    time: string[];
    rain_sum: number[];
  };
}

/**
 * Fetch rainfall for the last 30 days from Open-Meteo forecast API.
 */
export async function fetchRecentRainfall(
  lat: number,
  lng: number
): Promise<{ dates: string[]; rainMm: number[] }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=rain_sum&past_days=30&forecast_days=0&timezone=Asia/Kolkata`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

  const data: DailyWeatherResponse = await res.json();
  return {
    dates: data.daily.time,
    rainMm: data.daily.rain_sum,
  };
}

/**
 * Fetch historical rainfall for the same 30-day window from the previous year.
 * Uses Open-Meteo Archive API so we compare apples-to-apples
 * (same calendar period, not a flat annual average).
 */
export async function fetchHistoricalRainfall(
  lat: number,
  lng: number
): Promise<number> {
  const now = new Date();
  // Same 30-day window, one year ago
  const endDate = new Date(now);
  endDate.setFullYear(endDate.getFullYear() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 30);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${lat}&longitude=${lng}&start_date=${fmt(startDate)}&end_date=${fmt(endDate)}&daily=rain_sum&timezone=Asia/Kolkata`;

  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Open-Meteo Archive API error: ${res.status}`);

  const data: DailyWeatherResponse = await res.json();
  const total = data.daily.rain_sum.reduce((sum, r) => sum + (r ?? 0), 0);
  return total;
}

export async function fetchAllVillageRainfall(
  villages: Array<{ id: string; lat: number; lng: number }>
): Promise<Map<string, { dates: string[]; rainMm: number[] }>> {
  const results = new Map<string, { dates: string[]; rainMm: number[] }>();

  for (const village of villages) {
    try {
      const data = await fetchRecentRainfall(village.lat, village.lng);
      results.set(village.id, data);
    } catch {
      // Skip failed fetches
    }
    // Polite delay between API calls
    await new Promise((r) => setTimeout(r, 100));
  }

  return results;
}
