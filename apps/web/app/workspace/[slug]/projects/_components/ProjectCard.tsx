
"use client";

import {
  CalendarDays,
  CircleCheck,
  Clock3,
  MoreHorizontal,
  UserRound,
} from "lucide-react";
import { useEffect, useRef } from "react";
import type { Project } from "@/lib/projects";
import {
  formatDate,
  getDaysRemaining,
  priorityStyles,
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
  onEdit,
  onDelete,
}: Props) {
  const daysRemaining = getDaysRemaining(project.deadline ?? "");
  const menuRef = useRef<HTMLDetailsElement>(null);

  const totalTasks = project.totalTasks ?? project._count?.tasks ?? 0;
  const completedTasks = project.completedTasks ?? 0;
  const progress =
    totalTasks === 0
      ? 0
      : Math.min(100, Math.max(0, project.progress ?? 0));

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        menuRef.current.open = false;
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && menuRef.current) {
        menuRef.current.open = false;
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  return (
    <article
      onClick={() => onOpen(project)}
      className="group cursor-pointer rounded-2xl border border-[#E8E8EF] bg-white p-4 transition hover:border-[#B9E4CF] hover:shadow-[0_6px_24px_rgba(40,40,90,0.06)]"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-[#252638]">
            {project.name}
          </h3>

          <p className="mt-1 truncate text-sm text-[#858797]">
            {project.clientName || "No client assigned"}
          </p>
        </div>

        <div className="relative shrink-0">
          <details
            ref={menuRef}
            className="group/menu"
            onClick={(event) => event.stopPropagation()}
          >
            <summary
              aria-label={`Actions for ${project.name}`}
              className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg text-[#858797] transition hover:bg-[#F3F3F8] hover:text-[#454655]"
            >
              <MoreHorizontal size={19} />
            </summary>

            <div className="absolute right-0 top-9 z-10 min-w-32 rounded-xl border border-[#E8E8EF] bg-white p-1.5 shadow-lg">
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onEdit(project);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-[#454655] hover:bg-[#F5F5FA]"
              >
                Edit project
              </button>

              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  onDelete(project);
                }}
                className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </details>
        </div>
      </div>

      {project.description && (
        <p className="mt-2 line-clamp-2 min-h-0 text-sm leading-5 text-[#696B7C]">
          {project.description}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            statusStyles[project.status]
          }`}
        >
          {statusLabels[project.status]}
        </span>

        <span
          className={`text-xs font-medium ${
            priorityStyles[project.priority]
          }`}
        >
          {project.priority.charAt(0) +
            project.priority.slice(1).toLowerCase()}{" "}
          priority
        </span>
      </div>

      {/* Project progress */}
      <div className="mt-3">
        <div className="mb-1.5 flex items-center justify-between gap-3">
          <span className="text-xs font-medium text-[#696B7C]">
            Progress
          </span>
          <span className="text-xs font-semibold tabular-nums text-[#168653]">
            {progress}%
          </span>
        </div>

        <div
          role="progressbar"
          aria-label={`${project.name} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          className="h-1.5 overflow-hidden rounded-full bg-[#E8F3ED]"
        >
          <div
            className="h-full rounded-full bg-[#168653] transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-1 text-xs text-[#858797]">
          {completedTasks} of {totalTasks} tasks completed
        </p>
      </div>

      <div className="mt-2 border-t border-[#EEEEF2] pt-3">
        <div className="flex items-center justify-between gap-3 text-sm text-[#77798A]">
          <span className="inline-flex items-center gap-1.5">
            <CircleCheck size={15} />
            {totalTasks} tasks
          </span>

          <span className="inline-flex min-w-0 items-center gap-1.5">
            <UserRound size={15} />
            <span className="truncate">
              {project.createdBy?.name ?? "Creator unavailable"}
            </span>
          </span>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-[#77798A]">
            <CalendarDays size={14} />
            {project.deadline ? formatDate(project.deadline) : "No deadline"}
          </span>

          {daysRemaining !== null &&
            project.status !== "COMPLETED" &&
            project.status !== "ARCHIVED" && (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium ${
                  daysRemaining < 0 ? "text-red-600" : "text-[#77798A]"
                }`}
              >
                <Clock3 size={13} />
                {daysRemaining < 0
                  ? `${Math.abs(daysRemaining)}d overdue`
                  : daysRemaining === 0
                    ? "Due today"
                    : `${daysRemaining}d left`}
              </span>
            )}
        </div>
      </div>
    </article>
  );
}
