"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { FEATURED_CODE } from "@/config/site";

/**
 * The unit a visitor is looking at. Shared by the 3D explorer, the payment
 * planner and the viewing form so one choice follows them down the page.
 */
type Ctx = { code: string; setCode: (c: string) => void; currency: "KES" | "USD"; setCurrency: (c: "KES" | "USD") => void };
const SelCtx = createContext<Ctx>({ code: FEATURED_CODE, setCode: () => {}, currency: "KES", setCurrency: () => {} });
export const useSelection = () => useContext(SelCtx);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState(FEATURED_CODE);
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  return <SelCtx.Provider value={{ code, setCode, currency, setCurrency }}>{children}</SelCtx.Provider>;
}
