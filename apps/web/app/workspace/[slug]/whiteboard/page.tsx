import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import WhiteboardCanvas from "./WhiteboardCanvas";

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
>
  <div className="min-h-0 flex-1 py-3">
    <WhiteboardCanvas workspaceSlug={slug} />
  </div>
</WorkspaceSectionPage>
  );
}
