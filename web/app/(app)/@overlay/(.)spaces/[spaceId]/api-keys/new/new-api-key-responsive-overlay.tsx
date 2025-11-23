"use client";

import { CreateApiKeyResponse } from "@/@types/api-keys";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { cn } from "@/lib/utils";
import { useCreateApiKeyMutation } from "@/queries/api-keys";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { ClipboardCopyIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

interface NewApiKeyResponsiveOverlayProps {
  spaceId: string;
}

const createApiKeySchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(200, "Description must be at most 200 characters")
    .optional(),
});

type CreateApiKeySchema = z.infer<typeof createApiKeySchema>;

export function NewApiKeyResponsiveOverlay({ spaceId }: NewApiKeyResponsiveOverlayProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [createdApiKey, setCreatedApiKey] = useState<CreateApiKeyResponse | null>(null);

  const form = useForm<CreateApiKeySchema>({
    resolver: zodResolver(createApiKeySchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const { mutateAsync: createApiKey, isPending } = useCreateApiKeyMutation(spaceId);

  async function onSubmit(data: CreateApiKeySchema) {
    try {
      const apiKey = await createApiKey(data);

      setCreatedApiKey(apiKey);

      form.reset();
    } catch (error) {
      if (isAxiosError(error)) {
        const message = error.response?.data?.message || "An unexpected error occurred while creating the API Key.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred while creating the API Key.");
      }
    }
  }

  async function handleCopy(content: string) {
    try {
      await navigator.clipboard.writeText(content);
      toast.success("Copied to clipboard!");
    } catch {
      toast.error("Failed to copy to clipboard.");
    }
  }

  const createAPIKeyForm = (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className={cn(isMobile && "px-4")}>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormDescription>
                A descriptive name to identify this API Key.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem className={cn(isMobile && "px-4")}>
              <FormLabel>Description (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the purpose of this API Key..."
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isMobile && (
          <DrawerFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create API Key"
              )}
            </Button>
          </DrawerFooter>
        )}

        {!isMobile && (
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isPending}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create API Key"
              )}
            </Button>
          </DialogFooter>
        )}
      </form>
    </Form>
  )

  const apiKeyCreatedContent = (
    <div className={cn("space-y-4", isMobile && "px-4")}>
      <div className="space-y-3">
        <Label htmlFor="name">Name</Label>
        <div className="relative">
          <Input id="name" value={createdApiKey?.name} readOnly />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2"
            onClick={() => handleCopy(createdApiKey?.name || "")}
          >
            <ClipboardCopyIcon className="size-4" />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <Label htmlFor="description">Description</Label>
        <div className="relative">
          <Textarea
            id="description"
            value={createdApiKey?.description || "No description provided."}
            title={createdApiKey?.description || "No description provided."}
            readOnly
            className="max-h-36 break-all pr-10 resize-none overflow-y-hidden"
            rows={1}
          />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2"
            disabled={!createdApiKey?.description}
            onClick={() => handleCopy(createdApiKey?.description || "")}
          >
            <ClipboardCopyIcon className="size-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <Label htmlFor="apiKey" className="font-medium">API Key</Label>
        <div className="relative">
          <Input id="apiKey" value={createdApiKey?.key} readOnly className="pr-10 font-mono break-all" />
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            className="absolute right-0 top-0 h-full px-3 py-2"
            onClick={() => handleCopy(createdApiKey?.key || "")}
          >
            <ClipboardCopyIcon className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={router.back}>
        <DrawerContent>
          {createdApiKey && (
            <>
              <DrawerHeader>
                <DrawerTitle>API Key Created Successfully</DrawerTitle>
                <DrawerDescription>
                  Copy and save this key in a secure location. You will not be able to see it again!
                </DrawerDescription>
              </DrawerHeader>
              {apiKeyCreatedContent}
              <DrawerFooter>
                <DrawerClose asChild>
                  <Button className="w-full">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
          {!createdApiKey && (
            <>
              <DrawerHeader>
                <DrawerTitle>Create New API Key</DrawerTitle>
                <DrawerDescription>
                  Create a new API key to programmatically access this space.
                </DrawerDescription>
              </DrawerHeader>

              {createAPIKeyForm}
            </>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={true} onOpenChange={router.back}>
      <DialogContent>
        {createdApiKey && (
          <>
            <DialogHeader>
              <DialogTitle>API Key Created Successfully</DialogTitle>
              <DialogDescription>
                Copy and save this key in a secure location. You will not be able to see it again!
              </DialogDescription>
            </DialogHeader>
            {apiKeyCreatedContent}
            <DialogFooter>
              <DialogClose asChild>
                <Button className="w-full">Close</Button>
              </DialogClose>
            </DialogFooter>
          </>
        )}
        {!createdApiKey && (
          <>
            <DialogHeader className="relative">
              <DialogTitle>Create New API Key</DialogTitle>
              <DialogDescription>
                Create a new API key to programmatically access this space.
              </DialogDescription>
            </DialogHeader>
            {createAPIKeyForm}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}