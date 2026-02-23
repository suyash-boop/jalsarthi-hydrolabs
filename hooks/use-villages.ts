"use client";

import { useState, useEffect } from "react";
import type { Village, WaterSource } from "@/lib/types";
import {
  villages as mockVillages,
  waterSources as mockWaterSources,
} from "@/lib/mock-data";

interface UseVillagesReturn {
  villages: Village[];
  waterSources: WaterSource[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useVillages(): UseVillagesReturn {
  const [villages, setVillages] = useState<Village[]>(mockVillages);
  const [waterSources, setWaterSources] =
    useState<WaterSource[]>(mockWaterSources);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [villagesRes, sourcesRes] = await Promise.all([
        fetch("/api/villages"),
        fetch("/api/water-sources"),
      ]);

      if (villagesRes.ok) {
        const data = await villagesRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setVillages(data);
        }
        // If empty array from API, keep mock data as fallback
      }

      if (sourcesRes.ok) {
        const data = await sourcesRes.json();
        if (Array.isArray(data) && data.length > 0) {
          setWaterSources(data);
        }
      }
    } catch (err) {
      // Keep mock data on failure
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { villages, waterSources, loading, error, refetch: fetchData };
}
