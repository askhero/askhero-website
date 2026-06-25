import { useEffect, useMemo, useState } from "react";
import { fetchHeroAI } from "../services/heroAI";

const cache = new Map();

export function useHeroAI(type, payload) {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(Boolean(type));
  const [error, setError] = useState("");
  const key = useMemo(() => `${type}:${JSON.stringify(payload || {})}`, [type, payload]);

  useEffect(() => {
    if (!type) return;
    const cached = cache.get(key);
    if (cached && Date.now() - cached.time < 300000) {
      setInsight(cached.value);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchHeroAI(type, payload)
      .then((value) => {
        cache.set(key, { value, time: Date.now() });
        setInsight(value);
        setError("");
      })
      .catch((err) => setError(err.response?.data?.error || "AI unavailable"))
      .finally(() => setLoading(false));
  }, [type, key, payload]);

  return { insight, loading, error };
}
