"use client";

import { Trash2 } from "lucide-react";
import type { Project } from "@/lib/projects";
import {
  statusLabels,
  statusStyles,
} from "../_lib/project-types";

type Props = {
  project: Project;
  onOpen: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
};

export default function ProjectCard({
  project,
  onOpen,
  onDelete,
}: Props) {
  const totalTasks = project.totalTasks ?? project._count?.tasks ?? 0;
  const progress =
    totalTasks === 0
      ? 0
      : Math.min(100, Math.max(0, project.progress ?? 0));

  return (
    <div
      className="flex min-h-[66px] flex-wrap items-center gap-3 border-t border-[var(--workspace-line)] px-4 py-3 first:border-t-0 sm:flex-nowrap sm:gap-4 sm:px-5"
    >
      <button
        type="button"
        onClick={() => onOpen(project)}
        className="min-w-0 flex-1 truncate text-left focus-visible:rounded-sm"
      >
        <span className="block truncate text-sm font-medium text-[var(--workspace-ink)] hover:underline">
          {project.name}
        </span>
        <span className="mt-0.5 block truncate text-xs text-[var(--workspace-muted)]">
          {project.clientName || "No client assigned"}
        </span>
      </button>

      <span
        className={`min-w-[110px] rounded-full px-2.5 py-1 text-center text-xs font-medium ${
          statusStyles[project.status]
        }`}
      >
        {statusLabels[project.status]}
      </span>

      <div className="flex min-w-[150px] flex-1 items-center gap-3">
        <div
          role="progressbar"
          aria-label={`${project.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--workspace-surface-secondary)]"
        >
          <div
            className="h-full rounded-full bg-[var(--workspace-coral)] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="w-10 text-right text-xs font-medium tabular-nums text-[var(--workspace-ink)]">
          {progress}%
        </span>
      </div>

      <button
        type="button"
        onClick={() => onDelete(project)}
        aria-label={`Delete ${project.name}`}
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-coral-tint)] hover:text-[var(--workspace-coral)]"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}
