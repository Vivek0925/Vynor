import type { TaskPriority } from "./task-types";

type TaskPriorityBadgeProps = {
  priority: TaskPriority;
};

const priorityConfig: Record<
  TaskPriority,
  {
    label: string;
    className: string;
  }
> = {
  LOW: {
    label: "Low",
    className: "border border-[var(--workspace-line)] bg-[var(--workspace-surface-secondary)] text-[var(--workspace-muted)]",
  },
  MEDIUM: {
    label: "Medium",
    className: "border border-[var(--workspace-line)] bg-[var(--workspace-sage-tint)] text-[var(--workspace-ink)]",
  },
  HIGH: {
    label: "High",
    className: "border border-[var(--workspace-coral)]/40 bg-[var(--workspace-coral-tint)] text-[var(--workspace-coral)]",
  },
  URGENT: {
    label: "Urgent",
    className: "border border-[var(--workspace-coral)] bg-[var(--workspace-coral)] text-[var(--workspace-bg)]",
  },
};

export default function TaskPriorityBadge({
  priority,
}: TaskPriorityBadgeProps) {
  const config = priorityConfig[priority];

  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${config.className}`}
    >
      {config.label}
    </span>
  );
}