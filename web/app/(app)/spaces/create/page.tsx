"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, CircleCheckBigIcon, Loader2Icon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateSpaceMutation } from "@/queries/spaces";
import { toast } from "sonner";
import { isAxiosError } from "axios";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const createSpaceSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  shortDescription: z
    .string()
    .min(3, "Short description must be at least 3 characters")
    .max(40, "Short description must be at most 40 characters")
    .transform((val) => val.trim()),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters")
    .transform((val) => val?.trim() || undefined)
    .optional(),
  slug: z
    .string()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    })
    .refine(
      (val) => !val || (val.length >= 3 && val.length <= 40),
      "Slug must be between 3 and 40 characters",
    )
    .refine(
      (val) => !val || slugRegex.test(val),
      "Slug must contain only lowercase letters, numbers, and hyphens",
    )
    .optional(),
});

type CreateSpaceSchema = z.infer<typeof createSpaceSchema>;

export default function AddSpacePage() {
  const router = useRouter();
  const { mutateAsync: createSpace, isPending: isCreatingSpace } = useCreateSpaceMutation();

  const form = useForm<CreateSpaceSchema>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: "",
      shortDescription: "",
      description: "",
      slug: "",
    },
  });

  async function onSubmit(data: CreateSpaceSchema) {
    try {
      const { data: { spaceId } } = await createSpace(data);
      toast.success("Space created successfully!");
      router.push(`/spaces/${spaceId}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const code = error.response?.data?.code;

        if (code === "SPACE_SLUG_ALREADY_EXISTS") {
          form.setError("slug", {
            message: "This slug is already taken. Please choose another one.",
          });
        } else if (code === "VALIDATION_ERROR") {
          toast.error("Please check the form for errors");
          error.response?.data?.errors.forEach(({ field, message }: any) => {
            form.setError(field, {
              message,
            });
          });
        } else {
          toast.error("Failed to create space. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  return (
    <div className="flex flex-col min-h-dvh">
      <header className="sticky top-0 z-50 flex items-center justify-between px-2 py-3 backdrop-blur-xs bg-background/90 border-b border-border">
        <div className="flex items-center gap-1">
          <Button
            type="button"
            onClick={() => router.back()}
            variant="ghost"
            size="icon-sm"
            aria-label="Go back"
          >
            <ChevronLeftIcon className="size-5" aria-hidden="true" />
          </Button>
          <h1 className="text-xl font-bold">Create Space</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="My Awesome Space"
                      autoFocus
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The name of your space (3-50 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-awesome-space" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your space. If not provided, one
                    will be generated from the name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="shortDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="A quick summary of your space"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief summary displayed in listings (max 40 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A detailed description of your space"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed description of what this space is for (max 500
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isCreatingSpace}
              className="w-full"
            >
              {isCreatingSpace ?
                <>
                  Creating...
                  <Loader2Icon className="size-4 animate-spin" />
                </> : <>
                  Create Space
                  <CircleCheckBigIcon className="size-4" />
                </>
              }
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}