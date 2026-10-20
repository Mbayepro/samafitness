"use client";

import { createContext, useContext } from "react";
import { SITE_DATA } from "@/lib/site-data";
import type { SiteContentType } from "@/lib/content-store";

const SiteContext = createContext<SiteContentType>(SITE_DATA);

export function SiteProvider({
  content,
  children,
}: {
  content: SiteContentType;
  children: React.ReactNode;
}) {
  return <SiteContext.Provider value={content}>{children}</SiteContext.Provider>;
}

export function useSiteData(): SiteContentType {
  return useContext(SiteContext);
}
