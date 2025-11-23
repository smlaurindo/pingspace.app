"use client";

import { Button } from "@/components/ui/button";
import { useListApiKeysQuery } from "@/queries/api-keys";
import {
  ChevronLeftIcon,
  CircleX,
  ClipboardCopyIcon,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  Loader2Icon,
  PlusIcon,
  RotateCcwIcon,
  TrashIcon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function ApiKeysPage() {
  const { spaceId } = useParams() as { spaceId: string };
  const router = useRouter();
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const { data: apiKeys, isLoading, isRefetching, refetch, isError, isRefetchError } = useListApiKeysQuery(spaceId)

  function handleCopyKey(key: string) {
    navigator.clipboard.writeText(key);
    toast.success("API Key copiada para a área de transferência!");
  }

  function toggleKeyVisibility(keyId: string) {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  }

  function maskApiKey(key: string): string {
    if (key.length <= 8) return "••••••••";
    return `${key.slice(0, 4)}${"•".repeat(key.length - 8)}${key.slice(-4)}`;
  }

  const mustShowLoading = isLoading || isRefetching && !isError;
  const mustShowError = isError || isRefetchError && !isLoading && !isRefetching;
  const mustShowEmptyPlaceholder = !isLoading && apiKeys?.content?.length === 0;
  const mustShowData = !mustShowLoading && !mustShowEmptyPlaceholder && !mustShowError && apiKeys;

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
          <PlusIcon className="size-4" />
          New API Key
        </Button>
      </header>

      <main className="flex flex-col flex-1 p-4">
        {mustShowLoading && (
          <div className="flex flex-col flex-1 items-center justify-center py-12">
            <Loader2Icon className="size-6 animate-spin text-primary" />
          </div>
        )}
        {mustShowEmptyPlaceholder && (
          <div className="flex flex-col flex-1 items-center justify-center py-12 space-y-4">
            <KeyIcon className="size-12 text-muted-foreground" />
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">No API Keys created</h2>
              <p className="text-sm text-muted-foreground">
                Create your first API Key to start using the PingSpace API.
              </p>
              <Button size="sm" className="gap-2" onClick={() => router.push(`/spaces/${spaceId}/api-keys/new`)}>
                <PlusIcon className="size-4" />
                New API Key
              </Button>
            </div>
          </div>
        )}
        {mustShowError && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <CircleX className="size-12 text-destructive" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">Error loading API Keys</h2>
              <p className="text-sm text-muted-foreground">
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
          <>
            {apiKeys.content.map((apiKey) => {
              <div
                key={apiKey.id}
                className="p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{apiKey.name}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${apiKey.status === "ACTIVE"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400"
                          : "bg-gray-500/10 text-gray-600 dark:text-gray-400"
                          }`}
                      >
                        {apiKey.status === "ACTIVE" ? "Ativa" : "Inativa"}
                      </span>
                    </div>
                    {apiKey.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {apiKey.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Criada em {new Date(apiKey.createdAt).toLocaleDateString("pt-BR")}</span>
                      {apiKey.lastUsedAt && (
                        <>
                          <span>•</span>
                          <span>
                            Último uso em {new Date(apiKey.lastUsedAt).toLocaleDateString("pt-BR")}
                          </span>
                        </>
                      )}
                    </div>
                    {apiKey.key && (
                      <div className="flex items-center gap-2 p-2 rounded-md bg-muted border">
                        <code className="flex-1 text-xs font-mono break-all">
                          {visibleKeys.has(apiKey.id) ? apiKey.key : maskApiKey(apiKey.key)}
                        </code>
                        <div className="flex items-center gap-1">
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => toggleKeyVisibility(apiKey.id)}
                            aria-label={
                              visibleKeys.has(apiKey.id) ? "Ocultar API Key" : "Mostrar API Key"
                            }
                          >
                            {visibleKeys.has(apiKey.id) ? (
                              <EyeOffIcon className="size-3.5" />
                            ) : (
                              <EyeIcon className="size-3.5" />
                            )}
                          </Button>
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => handleCopyKey(apiKey.key!)}
                            aria-label="Copiar API Key"
                          >
                            <ClipboardCopyIcon className="size-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    aria-label="Excluir API Key"
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              </div>
            })}
          </>
        )}
      </main>
    </div >
  );
}
