interface EmptyWorkspaceStateProps {
  user?: { name?: string | null } | null;
}

export default function EmptyWorkspaceState({
  user,
}: EmptyWorkspaceStateProps) {
  return (
    <div className="rounded-[var(--radius-md)] border border-dashed border-ink/20 bg-surface-secondary px-6 py-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sage">
        <span className="h-3 w-3 rounded-[4px] bg-coral" />
      </div>
      <h3 className="text-[15px] font-medium text-ink">
        No workspace history yet
      </h3>
      <h4       className="mb-2 text-[20px] font-medium tracking-[-0.02em] text-ink">
        Welcome{user?.name ? `, ${user.name}` : ""}
      </h4>
      <p       className="mx-auto mt-2 max-w-[420px] text-[14px] leading-relaxed text-muted">
        Once you create your first workspace, it will appear here with recent
        activity, members, and the last time it was updated.
      </p>
    </div>
  );
}
