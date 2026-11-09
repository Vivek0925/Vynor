import WorkspaceSectionPage from "./_components/WorkspaceSectionPage";
import OverviewContent from "./_components/OverviewContent";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <WorkspaceSectionPage
      eyebrow="Overview"
      title="Overview"
      subtitle="Your workspace at a glance"
    >
      <OverviewContent workspaceSlug={slug} />
    </WorkspaceSectionPage>
  );
}
