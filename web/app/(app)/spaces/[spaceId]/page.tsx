"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { cn, formatRelativeDate } from "@/lib/utils";
import { useGetSpaceQuery } from "@/queries/spaces";
import { useListTopicsQuery } from "@/queries/topics";
import { ChevronLeftIcon, CirclePlusIcon, CircleX, KeySquareIcon, Loader2Icon, LogOutIcon, TextAlignJustifyIcon as MenuIcon, PinIcon, RotateCcwIcon, ShapesIcon, UsersRoundIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import type { PointerEvent } from "react";

export default function SpacePage() {
  const { spaceId } = useParams() as { spaceId: string };
  const router = useRouter();

  const {
    data: space,
    isLoading: isSpaceLoading,
    isError: isSpaceError,
  } = useGetSpaceQuery(spaceId);

  const {
    data: topics,
    isLoading: isTopicsLoading,
    isRefetching: isTopicsRefetching,
    isError: isTopicsError,
    refetch: refetchTopics,
    isRefetchError: isTopicsRefetchError,
  } = useListTopicsQuery(spaceId);

  const mustShowSpaceLoading = isSpaceLoading || isSpaceError;
  const mustShowSpaceData = !mustShowSpaceLoading && !!space;

  const mustShowTopicsLoading = isTopicsLoading || isTopicsRefetching;
  const mustShowTopicsError = (isTopicsError || isTopicsRefetchError) && !mustShowTopicsLoading;
  const mustShowTopicsEmptyPlaceholder = !mustShowTopicsLoading && Array.isArray(topics) && topics.length === 0;
  const mustShowTopicsData = !mustShowTopicsLoading && !mustShowTopicsEmptyPlaceholder && !mustShowTopicsError && Array.isArray(topics) && topics.length > 0;

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
            {mustShowSpaceLoading && (
              <div className="flex flex-col flex-1 items-center justify-center">
                <Loader2Icon className="size-5 animate-spin text-primary" />
              </div>
            )}
            {mustShowSpaceData && (
              <>
                <Avatar className="size-10">
                  <AvatarImage />
                  <AvatarFallback>{space.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <h2 className="text-base font-semibold truncate leading-tight">{space.name}</h2>
                  <p className="text-sm text-muted-foreground truncate">
                    {space.memberCount} {space.memberCount === 1 ? "member" : "members"}
                  </p>
                </div>
              </>
            )}
          </div>

        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg">
              <MenuIcon className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="pb-2">
            <DropdownMenuItem onClick={() => router.push(`/spaces/${spaceId}/api-keys`)}>
              <div
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background"
                aria-hidden="true"
              >
                <KeySquareIcon className="size-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start">
                <span>Create API Key</span>
                <span className="text-xs text-muted-foreground">Create a new API key for this space</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push(`/spaces/${spaceId}/topics/create`)}>
              <div
                className="flex size-9 items-center justify-center rounded-lg border border-border bg-background"
                aria-hidden="true"
              >
                <CirclePlusIcon className="size-5" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start">
                <span>Create Topic</span>
                <span className="text-xs text-muted-foreground">Create a new topic in this space</span>
              </div>
            </DropdownMenuItem>
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

      <main className="flex flex-col flex-1">
        {mustShowTopicsLoading && (
          <div className="flex flex-col flex-1 items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-primary" />
          </div>
        )}
        {mustShowTopicsError && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <CircleX className="size-12 text-destructive" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">Error loading Topics</h2>
              <p className="text-sm text-muted-foreground text-center">
                Unable to load Topics
              </p>
            </div>
            <Button variant="outline" onClick={() => refetchTopics({})}>
              <RotateCcwIcon className="size-4" />
              Try again
            </Button>
          </div>
        )}
        {mustShowTopicsEmptyPlaceholder && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <ShapesIcon className="size-12 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">No Topics created</h2>
              <p className="text-sm text-muted-foreground text-center">
                Create your first Topic to start using the Space.
              </p>
            </div>
            <Button className="gap-2" onClick={() => router.push(`/spaces/${spaceId}/topics/create`)}>
              <CirclePlusIcon className="size-4" />
              New Topic
            </Button>
          </div>
        )}
        {mustShowTopicsData && (
          <div className="divide-y divide-border dark:divide-border/50">
            {topics.map(topic => (
              <div
                role="button"
                key={topic.id}
                className="flex items-center justify-between px-4 py-3 hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50"
                onPointerDown={e => handleOpenTopicMenuOptions(e, topic.id)}
                onClick={() => handleOpenTopic(topic.id)}
                style={{ touchAction: "manipulation" }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <p className="self-start">{topic.emoji}</p>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-lg font-semibold truncate leading-tight">{topic.name}</h2>
                    <p className="text-sm text-muted-foreground truncate">
                      {topic.shortDescription}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span
                    className="text-sm text-nowrap"
                    title={topic.lastPingAt ? new Date(topic.lastPingAt).toISOString() : undefined}
                  >
                    {topic.lastPingAt ? formatRelativeDate(topic.lastPingAt) : ""}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className={cn(
                      "flex items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold size-fit p-0.5 px-2",
                      topic.unreadCount === 0 && "opacity-0"
                    )}>
                      {topic.unreadCount}
                    </span>
                    {topic.isPinned && <PinIcon className="size-4 text-muted-foreground" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}