import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api";

export function useDeal(dealId) {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(Boolean(dealId));
  const [error, setError] = useState("");

  const refetch = useCallback(async () => {
    if (!dealId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/deals/${dealId}`);
      setDeal(data.deal);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load deal");
    } finally {
      setLoading(false);
    }
  }, [dealId]);

  useEffect(() => {
    refetch();
    const id = setInterval(refetch, 30000);
    return () => clearInterval(id);
  }, [refetch]);

  return { deal, offers: deal?.offers || [], loading, error, refetch };
}
