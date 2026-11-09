"use client";

import { FolderKanban, Search } from "lucide-react";
import type { Project } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

type Props = {
  projects: Project[];
  hasProjects: boolean;
  onOpen: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onCreateProject: () => void;
  onClearFilters: () => void;
};

export default function ProjectsGrid({
  projects,
  hasProjects,
  onOpen,
  onEdit,
  onDelete,
  onCreateProject,
  onClearFilters,
}: Props) {
  if (projects.length === 0) {
    return (
      <div className="flex min-h-[270px] flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--workspace-line)] bg-[var(--workspace-surface-secondary)] px-2 py-7 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--workspace-coral-tint)] text-[var(--workspace-coral)]">
          {hasProjects ? <Search size={22} /> : <FolderKanban size={22} />}
        </div>

        <h3 className="mt-4 text-base font-medium text-[var(--workspace-ink)]">
          {hasProjects ? "No matching projects" : "No projects yet"}
        </h3>

        <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--workspace-muted)]">
          {hasProjects
            ? "Try a different search term or status filter."
            : "Create a project to start organizing your team's work in this workspace."}
        </p>

        {hasProjects ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="mt-5 rounded-xl border border-[var(--workspace-line)] px-4 py-2 text-sm font-medium text-[var(--workspace-ink)] transition hover:bg-[var(--workspace-surface)]"
          >
            Clear filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onCreateProject}
            className="mt-5 rounded-xl bg-[var(--workspace-coral)] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Create your first project
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[16px] border border-[var(--workspace-line)] bg-[var(--workspace-surface)]">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          onOpen={onOpen}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
