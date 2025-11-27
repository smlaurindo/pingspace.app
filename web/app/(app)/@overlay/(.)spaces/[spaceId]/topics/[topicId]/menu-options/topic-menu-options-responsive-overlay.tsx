"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { useDeleteTopicMutation, useGetTopicQuery } from "@/queries/topics";
import { CircleXIcon, Loader2Icon, PencilIcon, RotateCcwIcon, Trash2Icon, XIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface TopicMenuOptionsResponsiveOverlayProps {
  spaceId: string;
  topicId: string;
}

export function TopicMenuOptionsResponsiveOverlay({ spaceId, topicId }: TopicMenuOptionsResponsiveOverlayProps) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const {
    data: topic,
    isLoading,
    isRefetching,
    refetch,
    isError,
    isRefetchError
  } = useGetTopicQuery(spaceId, topicId);
  const {
    mutateAsync: deleteTopic,
    isPending: isDeletingTopic
  } = useDeleteTopicMutation();

  function handleViewTopic() {
    router.replace(`/${spaceId}/topics/${topicId}`);
  }

  async function handleDeleteTopic() {
    try {
      await deleteTopic({ spaceId, topicId });
      setDeleteDialogOpen(false);
      toast.success("Topic deleted successfully.", { position: isMobile ? "top-center" : "bottom-left" });
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast.error("Failed to delete topic. Please try again.", { position: isMobile ? "bottom-center" : "bottom-right" });
    }
  }

  const mustShowLoading = isLoading || isRefetching;
  const mustShowError = isError || isRefetchError && !(isLoading || isRefetching);
  const mustShowData = !mustShowLoading && !mustShowError && !!topic;

  const content = (
    <div className="p-4 space-y-3">
      {/* <Button className="w-full justify-start items-center" variant="outline" size="lg">
        <PencilIcon className="size-4.5" />
        Edit
      </Button> */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button className="w-full justify-start items-center text-destructive" variant="outline" size="lg">
            <Trash2Icon className="size-4.5" />
            Delete
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Topic</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{topic?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDeleteTopic}
              disabled={isDeletingTopic}
            >
              {isDeletingTopic ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  Confirm Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={true} onOpenChange={router.back}>
        <DrawerContent className="min-h-80">
          {mustShowLoading && (
            <div className="flex-1 flex items-center justify-center py-8">
              <Loader2Icon className="size-8 text-primary animate-spin" />
            </div>
          )}
          {mustShowError && (
            <div className="flex flex-col flex-1 items-center justify-center gap-4">
              <div className="bg-muted rounded-full p-5">
                <CircleXIcon className="size-10 text-destructive" />
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <h2 className="text-xl font-semibold">Error Loading Topic</h2>
                <p className="text-sm text-muted-foreground text-center">
                  Unable to load this topic.
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
              <DrawerHeader>
                <DrawerTitle>{topic.name}</DrawerTitle>
                <DrawerDescription>
                  Options and actions related to this topic.
                </DrawerDescription>
                <DrawerClose asChild>
                  <button
                    type="button"
                    className="absolute right-5 top-5 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
                    aria-label="Fechar"
                  >
                    <XIcon className="size-5" />
                  </button>
                </DrawerClose>
              </DrawerHeader>
              {content}
              <DrawerFooter>
                <Button onClick={handleViewTopic}>View</Button>
                <DrawerClose asChild>
                  <Button variant="outline">Close</Button>
                </DrawerClose>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Sheet open={true} onOpenChange={router.back}>
      <SheetContent>
        {mustShowLoading && (
          <div className="flex-1 flex items-center justify-center py-8">
            <Loader2Icon className="size-8 text-primary animate-spin" />
          </div>
        )}
        {mustShowError && (
          <div className="flex flex-col flex-1 items-center justify-center gap-4">
            <div className="bg-muted rounded-full p-6">
              <CircleXIcon className="size-12 text-destructive" />
            </div>
            <div className="flex flex-col items-center justify-center gap-2">
              <h2 className="text-xl font-semibold">Error Loading Topic</h2>
              <p className="text-sm text-muted-foreground text-center">
                Unable to load this topic.
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
            <SheetHeader>
              <SheetTitle>{topic.name}</SheetTitle>
              <SheetDescription>
                Options and actions related to this topic.
              </SheetDescription>
            </SheetHeader>
            {content}
            <SheetFooter>
              <Button onClick={handleViewTopic}>View</Button>
              <SheetClose asChild>
                <Button variant="outline">Close</Button>
              </SheetClose>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}