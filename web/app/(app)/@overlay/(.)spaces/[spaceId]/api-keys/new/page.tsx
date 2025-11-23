import { NewApiKeyResponsiveOverlay } from "./new-api-key-responsive-overlay";

export default async function NewApiKeyPage(
  { params }: { params: Promise<{ spaceId: string }> },
) {
  const { spaceId } = await params;

  return <NewApiKeyResponsiveOverlay spaceId={spaceId} />;
}