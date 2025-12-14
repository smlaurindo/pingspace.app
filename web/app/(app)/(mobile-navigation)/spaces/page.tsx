"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CirclePlusIcon, CircleXIcon, Loader2Icon, TextAlignJustifyIcon as MenuIcon, PinIcon, RotateCcwIcon, ShapesIcon, UsersRoundIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, type PointerEvent } from "react";
import { useListSpacesInfiniteQuery } from "@/queries/spaces";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useInView } from "react-intersection-observer";

export default function SpacesPage() {
  const router = useRouter();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    refetch,
    isError,
    isRefetchError
  } = useListSpacesInfiniteQuery();

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const spaces = data?.pages.flatMap(page => page.items);

  const mustShowLoading = isLoading;
  const mustShowError = (isError || isRefetchError) && !mustShowLoading;
  const mustShowEmptyPlaceholder = !mustShowLoading && Array.isArray(spaces) && spaces.length === 0;
  const mustShowData = !mustShowLoading && !mustShowEmptyPlaceholder && !mustShowError && Array.isArray(spaces) && spaces.length > 0;


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
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-xs bg-background/90 border-b border-border">
        <h1 className="text-2xl font-bold">Spaces</h1>

        <div className="flex items-center gap-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-lg">
                <MenuIcon className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="pb-2">
              <DropdownMenuItem onClick={() => router.push(`/spaces/create`)}>
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
              <DropdownMenuItem onClick={() => router.push(`/spaces/join`)}>
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

      <main className="flex flex-col flex-1">
        {mustShowLoading && (
          <div className="flex flex-col flex-1 items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-primary" />
          </div>
        )}
        {mustShowError && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <CircleXIcon className="size-12 text-destructive" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">Error loading Spaces</h2>
              <p className="text-sm text-muted-foreground text-center">
                Unable to load Spaces
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch({})}>
              <RotateCcwIcon className="size-4" />
              Try again
            </Button>
          </div>
        )}
        {mustShowEmptyPlaceholder && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <ShapesIcon className="size-12 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">No Spaces</h2>
              <p className="text-sm text-muted-foreground text-center">
                Create your first Space to start using the app.
              </p>
            </div>
            <Button className="gap-2" onClick={() => router.push(`/spaces/create`)}>
              <CirclePlusIcon className="size-4" />
              New Space
            </Button>
          </div>
        )}
        {mustShowData && (
          <div className="divide-y divide-border dark:divide-border/50">
            {spaces.map(space => (
              <div
                key={space.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                onPointerDown={e => handleOpenSpaceMenuOptions(e, space.id)}
                onClick={() => handleOpenSpace(space.id)}
                style={{ touchAction: "manipulation" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Avatar className="size-12">
                    <AvatarFallback>{space.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-lg font-semibold truncate leading-tight">{space.name}</h2>
                    <p className="text-sm text-muted-foreground truncate">{space.shortDescription}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className="text-sm text-nowrap"
                    title={space.lastPingAt ? new Date(space.lastPingAt).toISOString() : undefined}
                  >
                    {space.lastPingAt ? formatRelativeDate(space.lastPingAt) : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5 px-2",
                      space.unreadCount === 0 && "opacity-0"
                    )}>
                      {space.unreadCount}
                    </span>
                    {space.isPinned && <PinIcon className="size-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            ))}

            {hasNextPage && (
              <div ref={ref} className="col-span-full flex justify-center py-4">
                {isFetchingNextPage && (
                  <Loader2Icon className="size-6 animate-spin text-primary" />
                )}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}