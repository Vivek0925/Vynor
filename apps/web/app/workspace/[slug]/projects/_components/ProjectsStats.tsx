import {
  CalendarDays,
  Check,
  Clock3,
  FolderKanban,
} from "lucide-react";

import type { Project } from "@/lib/projects";

type ProjectsStatsProps = {
  projects: Project[];
};

export default function ProjectsStats({ projects }: ProjectsStatsProps) {
  const activeCount = projects.filter(
    (project) =>
      project.status === "IN_PROGRESS" ||
      project.status === "IN_REVIEW",
  ).length;

  const completedCount = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  const upcomingCount = projects.filter((project) => {
    if (!project.deadline) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const deadline = new Date(project.deadline);
    deadline.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil(
      (deadline.getTime() - today.getTime()) / 86400000,
    );

    return (
      daysRemaining >= 0 &&
      daysRemaining <= 14 &&
      project.status !== "COMPLETED" &&
      project.status !== "ARCHIVED"
    );
  }).length;

  const stats = [
    {
      label: "Total projects",
      value: projects.length,
      note: "Across this workspace",
      icon: FolderKanban,
    },
    {
      label: "Active projects",
      value: activeCount,
      note: "In progress or review",
      icon: Clock3,
    },
    {
      label: "Completed",
      value: completedCount,
      note: "Marked as completed",
      icon: Check,
    },
    {
      label: "Upcoming deadlines",
      value: upcomingCount,
      note: "Due within 14 days",
      icon: CalendarDays,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl my-3 border border-[#DEDFE8] bg-[#FAFAF8] p-3.5 sm:rounded-[22px] sm:p-5"
          >
            <div className="flex  items-center justify-between gap-2">
              <span className="text-[11px] text-[#5B5D6E] sm:text-[13px]">
                {stat.label}
              </span>

              <Icon className="h-4 w-4 shrink-0 text-[#087F5B]" />
            </div>

            <div className="mt-3 text-2xl font-medium tracking-[-0.04em] text-[#14141C] sm:text-3xl">
              {stat.value}
            </div>

            <div className="mt-1 text-[10px] text-[#777887] sm:text-[11px]">
              {stat.note}
            </div>
          </div>
        );
      })}
    </div>
  );
}