"use client";

import { useState, useEffect, useCallback } from "react";

interface UserRecord {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: "ADMIN" | "EDITOR" | "VIEWER";
  createdAt: string;
}

export function useUsers() {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users");
      if (res.ok) {
        setUsers(await res.json());
      } else if (res.status === 403) {
        setError("Access denied");
      } else {
        setError("Failed to fetch users");
      }
    } catch {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}
