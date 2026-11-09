import WorkspaceSectionPage from "./_components/WorkspaceSectionPage";
import MyTasksCard from "./_components/MyTasksCard";
import UpcomingMeetingsCard from "./_components/UpcomingMeetingsCard";

const documents = [
  { label: "Product Requirements.docx", meta: "Updated 2h ago" },
  { label: "API Documentation.md", meta: "Updated 5h ago" },
  { label: "Design System.fig", meta: "Updated 1d ago" },
];

function QuickStat({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-5 shadow-[0_10px_30px_rgba(23,32,26,0.04)]">
      <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--overview-muted)]">
        {label}
      </div>
      <div className="mt-3 text-[30px] font-normal tracking-[-0.04em] text-[var(--overview-ink)]">
        {value}
      </div>
      <div className="mt-1 text-[13px] text-[var(--overview-muted)]">{detail}</div>
    </div>
  );
}

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <WorkspaceSectionPage
      eyebrow="Overview"
      title="Workspace overview"
    >
      <div className="overview-theme">
        {/* Dashboard cards */}
        <div className="my-4 grid gap-4 xl:grid-cols-2">
          {/* My Tasks */}
          <MyTasksCard workspaceSlug={slug} />

          {/* Recent Activity */}
          <div className="rounded-[28px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-6">
            <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--overview-muted)]">
              Recent activity
            </div>
          </div>

          {/* Upcoming Meetings */}
          <UpcomingMeetingsCard workspaceSlug={slug} />
        </div>

        {/* Recent Documents */}
        <div className="my-4 rounded-[28px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--overview-muted)]">
                Recent documents
              </div>
            </div>

            <button className="rounded-full border border-[var(--overview-border)] px-4 py-2 text-[13px] font-medium text-[var(--overview-ink)] transition-colors hover:bg-[var(--overview-surface)]">
              View all documents
            </button>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {documents.map((doc) => (
              <div
                key={doc.label}
                className="rounded-[20px] border border-[var(--overview-surface)] bg-[var(--overview-surface)] p-4 shadow-[0_8px_20px_rgba(23,32,26,0.04)]"
              >
                <div className="text-[14px] font-medium text-[var(--overview-ink)]">
                  {doc.label}
                </div>

                <div className="mt-1 text-[13px] text-[var(--overview-muted)]">
                  {doc.meta}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </WorkspaceSectionPage>
  );
}
