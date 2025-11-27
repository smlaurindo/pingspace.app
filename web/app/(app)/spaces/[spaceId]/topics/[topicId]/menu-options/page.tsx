import { redirect } from "next/navigation";

export default async function Page(
  { params }: { params: Promise<{ spaceId: string; topicId: string }> },
) {
  const { spaceId } = await params;

  return redirect(`/spaces/${spaceId}`);
}