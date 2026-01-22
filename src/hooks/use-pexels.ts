"use client";

import { useState, useCallback } from "react";

export function usePexels() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchMedia = useCallback(async (query: string, type: "photos" | "videos" = "photos") => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/media?query=${encodeURIComponent(query)}&type=${type}`);
        if (!response.ok) {
          console.warn("Pexels API returned non-OK response:", response.status);
          return null;
        }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("usePexels error:", err);
      setError(err instanceof Error ? err.message : "Something went wrong");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchMedia, loading, error };
}
