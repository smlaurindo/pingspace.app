import { TopicMenuOptionsResponsiveOverlay } from "./topic-menu-options-responsive-overlay";

export default async function TopicMenuOptionsPage(
  { params }: { params: Promise<{ spaceId: string; topicId: string }> },
) {
  const { spaceId, topicId } = await params;

  return <TopicMenuOptionsResponsiveOverlay spaceId={spaceId} topicId={topicId} />;
}