"use client";

import { useState, useEffect, useCallback } from "react";
import type { ForecastResult } from "@/lib/forecast";

export function useForecast() {
  const [forecasts, setForecasts] = useState<ForecastResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForecast = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forecast");
      if (res.ok) {
        setForecasts(await res.json());
      } else {
        setError("Failed to fetch forecast data");
      }
    } catch {
      setError("Failed to fetch forecast data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  return { forecasts, loading, error, refetch: fetchForecast };
}
