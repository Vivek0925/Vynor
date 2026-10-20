"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";

import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import ProjectsStats from "./_components/ProjectsStats";
import ProjectsToolbar from "./_components/ProjectsToolbar";
import ProjectsGrid from "./_components/ProjectsGrid";
import ProjectFormModal from "./_components/ProjectFormModal";

import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from "@/lib/projects";
import type { Project, CreateProjectPayload } from "@/lib/projects";
import ProjectDetailModal from "./_components/ProjectDetailModal";

export default function ProjectsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const slug = params.slug;

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getProjects(slug);
      setProjects(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load projects.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.name.toLowerCase().includes(query) ||
        (project.clientName ?? "").toLowerCase().includes(query) ||
        (project.description ?? "").toLowerCase().includes(query);

      const matchesStatus = status === "ALL" || project.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [projects, search, status]);

  function openCreateModal() {
    setEditingProject(null);
    setModalOpen(true);
  }

  function openEditModal(project: Project) {
    setEditingProject(project);
    setModalOpen(true);
  }

  async function handleSave(data: CreateProjectPayload) {
    setSaving(true);
    setError("");

    try {
      if (editingProject) {
        await updateProject(slug, editingProject.id, data);
      } else {
        await createProject(slug, data);
      }

      setModalOpen(false);
      setEditingProject(null);
      await loadProjects();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save the project.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project: Project) {
    const confirmed = window.confirm(
      `Delete "${project.name}"? This action cannot be undone.`,
    );

    if (!confirmed) return;

    setError("");

    try {
      await deleteProject(slug, project.id);
      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete the project.",
      );
    }
  }

  function handleOpen(project: Project) {
    setSelectedProjectId(project.id);
  }

  return (
    <WorkspaceSectionPage
      eyebrow="Project management"
      title="Projects"
      description="Plan client work, track delivery, and keep every project moving."
    >
      <div className="space-y-6">
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">{error}</div>
            <button
              type="button"
              onClick={() => void loadProjects()}
              className="inline-flex shrink-0 items-center gap-1.5 font-medium hover:underline"
            >
              <RefreshCw size={14} />
              Retry
            </button>
          </div>
        )}

        {!loading && <ProjectsStats projects={projects} />}

        <ProjectsToolbar
          search={search}
          onSearchChange={setSearch}
          status={status}
          onStatusChange={setStatus}
          onCreateProject={openCreateModal}
        />

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-sm text-[#77798A]">
            <LoaderCircle size={20} className="animate-spin" />
            Loading projects...
          </div>
        ) : (
          <ProjectsGrid
            projects={filteredProjects}
            hasProjects={projects.length > 0}
            onOpen={handleOpen}
            onEdit={openEditModal}
            onDelete={(project) => void handleDelete(project)}
            onCreateProject={openCreateModal}
            onClearFilters={() => {
              setSearch("");
              setStatus("ALL");
            }}
          />
        )}
      </div>

      <ProjectFormModal
        open={modalOpen}
        project={editingProject}
        saving={saving}
        onClose={() => {
          if (!saving) {
            setModalOpen(false);
            setEditingProject(null);
          }
        }}
        onSubmit={handleSave}
      />

      <ProjectDetailModal
        open={selectedProjectId !== null}
        workspaceSlug={slug}
        projectId={selectedProjectId}
        onClose={() => setSelectedProjectId(null)}
        onProjectUpdated={() => void loadProjects()}
        onEdit={(project) => {
          setSelectedProjectId(null);
          setEditingProject(project);
          setModalOpen(true);
        }}
      />
    </WorkspaceSectionPage>
  );
}
