"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  FolderKanban,
  Loader2,
  Pencil,
  UserRound,
  X,
} from "lucide-react";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { getProject } from "@/lib/projects";
import type {
  ProjectDetails,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/projects";
import {
  priorityStyles,
  statusLabels,
  statusStyles,
} from "../_lib/project-types";

type Props = {
  open: boolean;
  workspaceSlug: string;
  projectId: string | null;
  onClose: () => void;
  onEdit: (project: ProjectDetails) => void;
};

const priorityLabels: Record<ProjectPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  URGENT: "Urgent",
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ProjectDetailModal({
  open,
  workspaceSlug,
  projectId,
  onClose,
  onEdit,
}: Props) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !projectId) {
      setProject(null);
      return;
    }

    let cancelled = false;

    async function loadProject() {
      setLoading(true);
      setError(null);

      try {
        const result = await getProject(workspaceSlug, projectId!);

        if (!cancelled) setProject(result);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load project details.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadProject();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug, projectId]);

  return (
    <Modal open={open} onClose={onClose} title="Project details">
      <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#737373]">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading project details...
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : project ? (
          <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:overflow-hidden">
            <section className="min-h-0 min-w-0 overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 break-words text-xl font-semibold text-[#20202A]">
                  {project.name}
                </h2>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEdit(project)}
                >
                  <Pencil className="mr-1.5 h-4 w-4" />
                  Edit
                </Button>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${statusStyles[project.status as ProjectStatus]}`}
                >
                  {statusLabels[project.status as ProjectStatus]}
                </span>

                <span
                  className={`rounded-md px-2.5 py-1 text-xs font-medium ${priorityStyles[project.priority]}`}
                >
                  {priorityLabels[project.priority]} priority
                </span>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-[#353541]">
                  Description
                </h3>
                <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#646471]">
                  {project.description || "No description provided."}
                </p>
              </div>

              <div className="mt-6 space-y-4 border-t border-[#ECECE7] pt-4">
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 h-4 w-4 text-[#777784]" />
                  <div>
                    <p className="text-xs text-[#777784]">Client</p>
                    <p className="mt-1 text-sm text-[#292934]">
                      {project.clientName || "No client assigned"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CalendarDays className="mt-0.5 h-4 w-4 text-[#777784]" />
                  <div>
                    <p className="text-xs text-[#777784]">Timeline</p>
                    <p className="mt-1 text-sm text-[#292934]">
                      {formatDate(project.startDate)} —{" "}
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock3 className="mt-0.5 h-4 w-4 text-[#777784]" />
                  <div>
                    <p className="text-xs text-[#777784]">Created by</p>
                    <p className="mt-1 text-sm text-[#292934]">
                      {project.createdBy?.name ?? "Unknown"}
                    </p>
                    <p className="mt-0.5 text-xs text-[#92929D]">
                      {formatDate(project.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="flex min-h-[280px] min-w-0 flex-col overflow-hidden border-t border-[#ECECE7] md:min-h-0 md:border-l md:border-t-0">
              <div className="flex h-[58px] shrink-0 items-center gap-2 border-b border-[#ECECE7] px-4 sm:px-6">
                <FolderKanban className="h-4 w-4 text-[#168653]" />
                <h3 className="text-sm font-semibold text-[#292934]">
                  Project tasks
                </h3>
                <span className="rounded-full bg-[#E7F5EF] px-2 py-0.5 text-xs text-[#168653]">
                  {project.totalTasks ?? project.tasks.length}
                </span>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
                {project.tasks.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center px-4 py-10 text-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E7F5EF]">
                      <FolderKanban className="h-5 w-5 text-[#168653]" />
                    </div>
                    <p className="mt-3 text-sm font-medium text-[#353541]">
                      No tasks linked yet
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[#858591]">
                      Tasks associated with this project will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {project.tasks.map((task) => (
                      <article
                        key={task.id}
                        className="rounded-xl border border-[#E5E7EB] p-3"
                      >
                        <p className="break-words text-sm font-medium text-[#292934]">
                          {task.title}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                          <span
                            className={`rounded-md px-2 py-1 text-xs ${priorityStyles[task.priority]}`}
                          >
                            {priorityLabels[task.priority]} priority
                          </span>

                          <span className="text-xs text-[#777784]">
                            {task.assignee?.name ?? "Unassigned"}
                          </span>
                        </div>

                        {task.dueDate && (
                          <p className="mt-2 text-xs text-[#777784]">
                            Due {formatDate(task.dueDate)}
                          </p>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        ) : (
          <div className="py-12 text-center text-sm text-[#777784]">
            Project not found.
          </div>
        )}
      </div>
    </Modal>
  );
}