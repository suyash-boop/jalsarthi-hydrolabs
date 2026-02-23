interface DailyWeatherResponse {
  daily: {
    time: string[];
    rain_sum: number[];
  };
}

export async function fetchRecentRainfall(
  lat: number,
  lng: number
): Promise<{ dates: string[]; rainMm: number[] }> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&daily=rain_sum&past_days=30&timezone=Asia/Kolkata`;

  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`Open-Meteo API error: ${res.status}`);

  const data: DailyWeatherResponse = await res.json();
  return {
    dates: data.daily.time,
    rainMm: data.daily.rain_sum,
  };
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
