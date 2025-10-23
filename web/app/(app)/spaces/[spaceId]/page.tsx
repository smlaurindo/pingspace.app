"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronLeftIcon, LogOutIcon, TextAlignJustifyIcon as MenuIcon, PinIcon, UsersRoundIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { type PointerEvent } from "react";

export default function SpacePage() {
  const { spaceId } = useParams() as { spaceId: string };
  const router = useRouter();

  function handleOpenTopicMenuOptions(e: PointerEvent<HTMLDivElement>, topicId: string) {
    let timer: NodeJS.Timeout;
    timer = setTimeout(() => {
      router.push(`/spaces/${spaceId}/topics/${topicId}/menu-options`, { scroll: false });
    }, 600);
    const clear = () => clearTimeout(timer);
    e.currentTarget.addEventListener("pointerup", clear, { once: true });
    e.currentTarget.addEventListener("pointerleave", clear, { once: true });
  }

  function handleOpenSpaceDetails() {
    router.push(`/spaces/${spaceId}/details`);
  }

  function handleOpenTopic(topicId: string) {
    router.push(`/spaces/${spaceId}/topics/${topicId}`);
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-50 flex items-center justify-between px-2 py-3 backdrop-blur-xs bg-background/90 border-b border-border">
        <div className="flex items-center gap-1 min-w-0">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-2 min-w-0 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 rounded-md" onClick={handleOpenSpaceDetails}>
            <Avatar className="size-10">
              <AvatarImage />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <h2 className="text-base font-semibold truncate leading-tight">SaaS</h2>
              <p className="text-sm text-muted-foreground truncate">2 members</p>
            </div>
          </div>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg">
              <MenuIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="pb-2">
            <DropdownMenuItem onClick={() => router.push(`/spaces/${spaceId}/leave`)}>
              <div
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background"
                aria-hidden="true"
              >
                <LogOutIcon className="size-5 text-destructive" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start">
                <span>Leave Space</span>
                <span className="text-xs text-muted-foreground">Leave the current space</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <main className="flex-1 flex flex-col">
        <div className="divide-y divide-border dark:divide-border/50">
          <div
            className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
            onPointerDown={e => handleOpenTopicMenuOptions(e, "1")}
            onClick={() => handleOpenTopic("1")}
            style={{ touchAction: "manipulation" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* <Avatar className="size-12">
                <AvatarImage />
                <AvatarFallback>OF</AvatarFallback>
              </Avatar> */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-semibold truncate leading-tight">New Users</h2>
                <p className="text-sm text-muted-foreground truncate">
                  Pings related to new user registrations.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-nowrap">2:35 PM</span>
              <div className="flex items-center gap-1">
                <span className="flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5">
                  9290
                </span>
                <PinIcon className="size-4 text-muted-foreground" />
              </div>
            </div>
          </div>
          <div
            className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
            onPointerDown={e => handleOpenTopicMenuOptions(e, "2")}
            onClick={() => handleOpenTopic("2")}
            style={{ touchAction: "manipulation" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* <Avatar className="size-12">
                <AvatarImage />
                <AvatarFallback>OF</AvatarFallback>
              </Avatar> */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-semibold truncate leading-tight">Deployment Pings</h2>
                <p className="text-sm text-muted-foreground truncate">
                  Pings related to deployment status and health checks.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-nowrap">5:35 PM</span>
              <span className="flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5">
                2
              </span>
            </div>
          </div>
          <div
            className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
            onPointerDown={e => handleOpenTopicMenuOptions(e, "3")}
            onClick={() => handleOpenTopic("3")}
            style={{ touchAction: "manipulation" }}
          >
            <div className="flex items-center gap-2 min-w-0">
              {/* <Avatar className="size-12">
                <AvatarImage />
                <AvatarFallback>OF</AvatarFallback>
              </Avatar> */}
              <div className="flex flex-col min-w-0">
                <h2 className="text-lg font-semibold truncate leading-tight">New Subscriptions</h2>
                <p className="text-sm text-muted-foreground truncate">
                  Pings related to user subscriptions and billing.
                </p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-nowrap">10:00 AM</span>
              <span className="flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5">
                5
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}