"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CirclePlusIcon, TextAlignJustifyIcon as MenuIcon, PinIcon, UsersRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type PointerEvent } from "react";
import { formatDate, parseISO } from "date-fns";

export default function OverviewPage() {
  const router = useRouter();

  function handleOpenSpaceMenuOptions(e: PointerEvent<HTMLDivElement>, spaceId: string) {
    let timer: NodeJS.Timeout;
    timer = setTimeout(() => {
      router.push(`/spaces/${spaceId}/menu-options`, { scroll: false });
    }, 600);
    const clear = () => clearTimeout(timer);
    e.currentTarget.addEventListener("pointerup", clear, { once: true });
    e.currentTarget.addEventListener("pointerleave", clear, { once: true });
  }

  function handleOpenSpace(spaceId: string) {
    router.push(`/spaces/${spaceId}`);
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-4 backdrop-blur-xs bg-background/90 border-b border-border">
        <h1 className="text-2xl font-bold">Spaces</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg">
                <MenuIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="pb-2">
              <DropdownMenuItem>
                <div
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background"
                  aria-hidden="true"
                >
                  <CirclePlusIcon className="size-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start">
                  <span>Create Space</span>
                  <span className="text-xs text-muted-foreground">Create a new space</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div
                  className="flex size-9 items-center justify-center rounded-lg border border-border bg-background"
                  aria-hidden="true"
                >
                  <UsersRoundIcon className="size-5" strokeWidth={2} />
                </div>
                <div className="flex flex-col items-start">
                  <span>Join a Space</span>
                  <span className="text-xs text-muted-foreground">Access an existing space</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="divide-y divide-border dark:divide-border/50">
          <div
            className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
            onPointerDown={e => handleOpenSpaceMenuOptions(e, "1")}
            onClick={() => handleOpenSpace("1")}
            style={{ touchAction: "manipulation" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Avatar className="size-12">
                <AvatarImage />
                <AvatarFallback>S</AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-semibold truncate leading-tight">SaaS</h2>
                <p className="text-sm text-muted-foreground truncate">SaaS space for collaboration</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm">{formatDate(parseISO(new Date().toISOString()), "yyyy-MM-dd")}</span>
              <div className="flex items-center gap-1">
                <span className="flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5">
                  9290
                </span>
                <PinIcon className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}