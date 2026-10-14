import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import WhiteboardCanvas from "./WhiteboardCanvas";
import WhiteboardPageClient from "./WhiteboardPageClient";

export default async function WhiteboardPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <WorkspaceSectionPage
      eyebrow="Whiteboard"
      title="Whiteboard"
      description="Sketch ideas, map flows, and plan visually inside the workspace route."
      contentClassName="overflow-hidden flex flex-col"
      headerActions={<WhiteboardPageClient />}
    >
      <div className="min-h-[360px] min-w-0 flex-1 py-2 sm:min-h-0 sm:py-3">
        <WhiteboardCanvas workspaceSlug={slug} />
      </div>
    </WorkspaceSectionPage>
  );
}
