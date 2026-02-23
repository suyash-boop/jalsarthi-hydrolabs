"use client";

import { useState, useEffect, useCallback } from "react";
import type { Tanker } from "@/lib/types";

export function useTankers() {
  const [tankers, setTankers] = useState<Tanker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTankers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tankers");
      if (res.ok) {
        setTankers(await res.json());
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTankers();
  }, [fetchTankers]);

  return { tankers, loading, refetch: fetchTankers };
}
