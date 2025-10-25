"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeftIcon,
  CircleCheckBigIcon,
  Loader2Icon,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
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
import { useCreateTopicMutation } from "@/queries/topics";
import { toast } from "sonner";
import { isAxiosError } from "axios";
import { useEffect, useState } from "react";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const commonEmojis = [
  "🎯", "🚀", "💡", "⭐", "🔥", "💬", "📢", "🎉", "✨", "🌟",
  "📱", "💻", "🎨", "🎵", "📚", "🔔", "⚡", "🌈", "🎁", "🏆",
  "💰", "🎮", "🎬", "📷", "🎤", "🎧", "🎸", "🎹", "🎺", "🎻",
  "🌍", "🌎", "🌏", "🗺️", "🧭", "🏔️", "⛰️", "🌋", "🏕️", "🏖️",
];

function getRandomEmoji() {
  return commonEmojis[Math.floor(Math.random() * commonEmojis.length)];
}

const createTopicSchema = z.object({
  name: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .max(50, "Name must be at most 50 characters"),
  emoji: z.string().min(1, "Emoji is required"),
  shortDescription: z
    .string()
    .min(3, "Short description must be at least 3 characters")
    .max(100, "Short description must be at most 100 characters")
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
      "Slug must be between 3 and 40 characters"
    )
    .refine(
      (val) => !val || slugRegex.test(val),
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .optional(),
});

type CreateTopicSchema = z.infer<typeof createTopicSchema>;

export default function CreateTopicPage() {
  const { spaceId } = useParams() as { spaceId: string };
  const { mutateAsync: createTopic, isPending: isCreatingTopic } =
    useCreateTopicMutation(spaceId);
  const router = useRouter();
  const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);

  const form = useForm<CreateTopicSchema>({
    resolver: zodResolver(createTopicSchema),
    defaultValues: {
      name: "",
      emoji: getRandomEmoji(),
      shortDescription: "",
      description: "",
      slug: "",
    },
  });

  useEffect(() => {
    if (!form.getValues("emoji")) {
      form.setValue("emoji", getRandomEmoji());
    }
  }, [form]);

  async function onSubmit(data: CreateTopicSchema) {
    try {
      await createTopic(data);
      toast.success("Topic created successfully!");
      router.push(`/spaces/${spaceId}`);
    } catch (error) {
      if (isAxiosError(error)) {
        const code = error.response?.data?.code;

        if (code === "TOPIC_SLUG_ALREADY_EXISTS") {
          form.setError("slug", {
            message: "This slug is already taken. Please choose another one.",
          });
        } else if (code === "VALIDATION_ERROR") {
          toast.error("Please check the form for errors");
        } else {
          toast.error("Failed to create topic. Please try again.");
        }
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    form.setValue("emoji", emojiData.emoji);
    setEmojiPickerOpen(false);
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
          <h1 className="text-xl font-bold">Create Topic</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 max-w-2xl mx-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-start gap-4">
              <FormField
                control={form.control}
                name="emoji"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emoji</FormLabel>
                    <FormControl>
                      <Popover
                        open={emojiPickerOpen}
                        onOpenChange={setEmojiPickerOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            className="size-16 text-3xl"
                          >
                            {field.value}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border-0"
                          align="start"
                        >
                          <EmojiPicker onEmojiClick={handleEmojiClick} />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="notifications"
                        autoFocus
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      The name of your topic (3-50 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="notifications" {...field} />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for your topic. If not provided, one
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
                      placeholder="A quick summary of your topic"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A brief summary displayed in listings (3-100 characters)
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
                      placeholder="A detailed description of your topic"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    A detailed description of what this topic is for (max 500
                    characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              disabled={isCreatingTopic}
              className="w-full"
            >
              {isCreatingTopic ? (
                <>
                  Creating...
                  <Loader2Icon className="size-4 animate-spin" />
                </>
              ) : (
                <>
                  Create Topic
                  <CircleCheckBigIcon className="size-4" />
                </>
              )}
            </Button>
          </form>
        </Form>
      </main>
    </div>
  );
}
