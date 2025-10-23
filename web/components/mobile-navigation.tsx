"use client";

import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { AtomIcon, Settings2Icon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileNavigation() {
  const isMobile = useIsMobile();
  const pathname = usePathname();

  if (!isMobile) {
    return null
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex gap-1 items-center justify-around px-2 py-2">
        <Link
          href={"/spaces"}
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "min-w-0 flex-1",
            pathname === "/spaces"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <AtomIcon className="size-5" />
          <span className="text-xs font-medium truncate">Spaces</span>
        </Link>
        <Link
          href={"/settings"}
          prefetch={true}
          className={cn(
            "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
            "min-w-0 flex-1",
            pathname === "/settings"
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          <Settings2Icon className="size-5" />
          <span className="text-xs font-medium truncate">Settings</span>
        </Link>
      </div>
    </nav>
  )
}