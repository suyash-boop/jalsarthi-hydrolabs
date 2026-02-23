"use client";

import { useState, useEffect, useCallback } from "react";
import type { Dispatch } from "@/lib/types";

export function useDispatches() {
  const [dispatches, setDispatches] = useState<Dispatch[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDispatches = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dispatches");
      if (res.ok) {
        setDispatches(await res.json());
      }
    } catch {
      // keep existing data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDispatches();
  }, [fetchDispatches]);

  return { dispatches, loading, refetch: fetchDispatches };
}
