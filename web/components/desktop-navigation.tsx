"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";

export function DesktopNavigation() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return null;
  }

  return (
    <aside className="">

    </aside>
  )
}