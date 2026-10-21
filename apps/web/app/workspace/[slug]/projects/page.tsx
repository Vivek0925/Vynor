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
import { socket } from "@/lib/socket";

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

  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [notification, setNotification] = useState("");

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
    const handleProjectChange = () => {
      void loadProjects();
    };

    const handleProjectDeleted = (event: { projectId: string }) => {
      handleProjectChange();

      if (selectedProjectId === event.projectId) {
        setSelectedProjectId(null);
        setNotification("This project was deleted in another tab.");
      }
    };

    socket.on("project:created", handleProjectChange);
    socket.on("project:updated", handleProjectChange);
    socket.on("project:deleted", handleProjectDeleted);

    return () => {
      socket.off("project:created", handleProjectChange);
      socket.off("project:updated", handleProjectChange);
      socket.off("project:deleted", handleProjectDeleted);
    };
  }, [loadProjects, selectedProjectId]);

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

  async function handleDelete() {
    if (!projectToDelete) return;

    const project = projectToDelete;
    setError("");

    try {
      await deleteProject(slug, project.id);

      setProjects((current) =>
        current.filter((item) => item.id !== project.id),
      );

      if (selectedProjectId === project.id) {
        setSelectedProjectId(null);
      }

      setProjectToDelete(null);
      setNotification(`Project "${project.name}" was deleted.`);
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
            onDelete={(project) => setProjectToDelete(project)}
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

      {notification && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm text-emerald-800 shadow-xl"
        >
          <span>{notification}</span>
          <button
            type="button"
            onClick={() => setNotification("")}
            className="font-medium hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {projectToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-4">
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            aria-describedby="delete-project-description"
            className="w-full max-w-md rounded-2xl border border-[#E8E8ED] bg-white p-6 shadow-2xl"
          >
            <h2
              id="delete-project-title"
              className="text-lg font-semibold text-[#20212B]"
            >
              Delete project?
            </h2>

            <p
              id="delete-project-description"
              className="mt-2 text-sm leading-6 text-[#77798A]"
            >
              Delete "{projectToDelete.name}"? This action cannot be undone.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="rounded-xl border border-[#E8E8ED] px-4 py-2 text-sm font-medium text-[#555667] transition hover:bg-[#F7F7FA]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                className="rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Delete project
              </button>
            </div>
          </div>
        </div>
      )}
    </WorkspaceSectionPage>
  );
}
