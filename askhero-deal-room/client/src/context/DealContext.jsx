import { createContext, useMemo, useState } from "react";

export const DealContext = createContext(null);

export function DealProvider({ children }) {
  const [activeDeal, setActiveDeal] = useState(null);
  const value = useMemo(() => ({ activeDeal, setActiveDeal }), [activeDeal]);
  return <DealContext.Provider value={value}>{children}</DealContext.Provider>;
}
