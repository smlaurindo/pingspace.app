"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useListApiKeysInfiniteQuery } from "@/queries/api-keys";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import {
  CalendarIcon,
  ChevronLeftIcon,
  CirclePlusIcon,
  CircleX,
  ClockIcon,
  CopyIcon,
  KeyIcon,
  Loader2Icon,
  MoreVerticalIcon,
  RotateCcwIcon,
  UserIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useInView } from "react-intersection-observer";
import { useEffect } from "react";

export default function ApiKeysPage() {
  const { spaceId } = useParams() as { spaceId: string };
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
  } = useListApiKeysInfiniteQuery(spaceId)

  const { ref, inView } = useInView();

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const apiKeys = data?.pages.flatMap(page => page.items);

  const mustShowLoading = isLoading;
  const mustShowError = isError || isRefetchError && !isLoading;
  const mustShowEmptyPlaceholder = !isLoading && apiKeys?.length === 0;
  const mustShowData = !mustShowLoading && !mustShowEmptyPlaceholder && !mustShowError && (apiKeys?.length || 0) > 0;

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur-xs bg-background/90 border-b border-border">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            size="icon-sm"
            className="size-7"
            aria-label="Voltar"
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </Button>
          <div className="flex items-center gap-2">
            <KeyIcon className="size-5" />
            <h1 className="text-lg font-semibold">API Keys</h1>
          </div>
        </div>

        <Button size="sm" className="gap-2" onClick={() => router.push(`/spaces/${spaceId}/api-keys/new`)}>
          <CirclePlusIcon className="size-4" />
          New API Key
        </Button>
      </header>

      <main className="flex flex-col flex-1 p-4">
        {mustShowLoading && (
          <div className="flex flex-col flex-1 items-center justify-center">
            <Loader2Icon className="size-6 animate-spin text-primary" />
          </div>
        )}
        {mustShowEmptyPlaceholder && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <KeyIcon className="size-12 text-muted-foreground" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">No API Keys created</h2>
              <p className="text-sm text-muted-foreground text-center">
                Create your first API Key to start using the PingSpace API.
              </p>
            </div>
            <Button className="gap-2" onClick={() => router.push(`/spaces/${spaceId}/api-keys/new`)}>
              <CirclePlusIcon className="size-4" />
              New API Key
            </Button>
          </div>
        )}
        {mustShowError && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <CircleX className="size-12 text-destructive" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">Error loading API Keys</h2>
              <p className="text-sm text-muted-foreground text-center">
                Unable to load API Keys
              </p>
            </div>
            <Button variant="outline" onClick={() => refetch({})}>
              <RotateCcwIcon className="size-4" />
              Try again
            </Button>
          </div>
        )}
        {mustShowData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 overflow-hidden">
            {apiKeys?.map((apiKey) => (
              <Card className="hover:shadow-lg transition-shadow" key={apiKey.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start overflow-hidden">
                    <div className="flex flex-col flex-1 min-w-0">
                      <CardTitle className="text-lg font-semibold truncate">{apiKey.name}</CardTitle>
                      <CardDescription className="mt-1 truncate">{apiKey.description || " "}</CardDescription>
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Badge variant={apiKey.status === "ACTIVE" ? "default" : "secondary"}>{apiKey.status}</Badge>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreVerticalIcon className="size-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* {onCopy && (
                            <>
                              <DropdownMenuItem onClick={() => onCopy(apiKey.id)}>
                                <Copy className="size-4 mr-2" />
                                Copiar ID
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                            </>
                          )}
                          {onEdit && <DropdownMenuItem onClick={() => onEdit(apiKey.id)}>Editar</DropdownMenuItem>}
                          {onToggleStatus && (
                            <DropdownMenuItem onClick={() => onToggleStatus(apiKey.id)}>
                              {apiKey.status === "ACTIVE" ? "Desativar" : "Ativar"}
                            </DropdownMenuItem>
                          )}
                          {onDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDelete(apiKey.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                Excluir
                              </DropdownMenuItem>
                            </>
                          )} */}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="size-4 shrink-0" />
                    <span className="truncate">Created by {apiKey.createdBy?.nickname ?? "Deleted user"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CalendarIcon className="size-4 shrink-0" />
                    <span>Created {formatDistanceToNowStrict(parseISO(apiKey.createdAt), { addSuffix: true })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ClockIcon className="size-4 shrink-0" />
                    <span>{apiKey.lastUsedAt ? `Used ${formatDistanceToNowStrict(parseISO(apiKey.lastUsedAt), { addSuffix: true })}` : "Never used"}</span>
                  </div>
                </CardContent>
              </Card>
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
