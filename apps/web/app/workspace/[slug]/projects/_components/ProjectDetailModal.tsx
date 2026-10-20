"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  Clock3,
  FolderKanban,
  Loader2,
  Pencil,
  UserRound,
  Plus,
  Link2,
  Unlink,
  Trash2,
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
  createTask,
  deleteTask,
  getTaskLists,
  getWorkspaceTasks,
  updateTask,
  moveTask,
  type Task,
  type TaskList,
} from "@/lib/tasks";
import {
  priorityStyles,
  statusLabels,
  statusStyles,
} from "../_lib/project-types";

import { useMemo } from "react";
import CreateTaskModal from "../../tasks/_components/CreateTaskModal";

type Props = {
  open: boolean;
  workspaceSlug: string;
  projectId: string | null;
  onClose: () => void;
  onEdit: (project: ProjectDetails) => void;
  onProjectUpdated?: () => void;
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
  onProjectUpdated,
}: Props) {
  const [project, setProject] = useState<ProjectDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatingTaskIds, setUpdatingTaskIds] = useState<string[]>([]);
  const [taskError, setTaskError] = useState<string | null>(null);

  const [createTaskOpen, setCreateTaskOpen] = useState(false);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [workspaceTasks, setWorkspaceTasks] = useState<Task[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [selectedListId, setSelectedListId] = useState("");
  const [loadingTaskOptions, setLoadingTaskOptions] = useState(false);
  const [linkingTasks, setLinkingTasks] = useState(false);

  const loadProject = useCallback(async () => {
    if (!projectId) return;

    setLoading(true);
    setError(null);

    try {
      const result = await getProject(workspaceSlug, projectId);
      setProject(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load project details.",
      );
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug, projectId]);

  const availableTasks = useMemo(
    () =>
      workspaceTasks.filter(
        (task) =>
          !task.projectId &&
          !project?.tasks.some((item) => item.id === task.id),
      ),
    [workspaceTasks, project],
  );

  useEffect(() => {
    if (!open || !projectId) {
      setProject(null);
      return;
    }

    let cancelled = false;

    async function load() {
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

    void load();

    return () => {
      cancelled = true;
    };
  }, [open, workspaceSlug, projectId]);

  const loadTaskOptions = useCallback(async () => {
    setLoadingTaskOptions(true);
    setTaskError(null);

    try {
      const [lists, tasks] = await Promise.all([
        getTaskLists(workspaceSlug),
        getWorkspaceTasks(workspaceSlug),
      ]);

      setTaskLists(lists);
      setWorkspaceTasks(tasks);

      setSelectedListId((current) => {
        if (current && lists.some((list) => list.id === current)) {
          return current;
        }

        return lists[0]?.id ?? "";
      });
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Unable to load workspace tasks.",
      );
    } finally {
      setLoadingTaskOptions(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (!open || !projectId) return;

    void loadTaskOptions();
  }, [open, projectId, loadTaskOptions]);

  async function handleTaskCompletion(taskId: string, isCompleted: boolean) {
    if (!project || updatingTaskIds.includes(taskId)) return;

    const task = project.tasks.find((item) => item.id === taskId);
    const workspaceTask = workspaceTasks.find((item) => item.id === taskId);

    if (!task || !workspaceTask) {
      setTaskError("Unable to find this task in Workspace Tasks.");
      return;
    }

    const targetName = isCompleted ? "DONE" : "TODO";
    const targetList = taskLists.find(
      (list) => list.name.trim().toUpperCase() === targetName,
    );

    if (!targetList) {
      setTaskError(`Please create a "${targetName}" list first.`);
      return;
    }

    const previousProject = project;
    const targetPosition =
      workspaceTask.listId === targetList.id
        ? workspaceTask.position
        : targetList.tasks.length;

    setTaskError(null);
    setUpdatingTaskIds((ids) => [...ids, taskId]);

    try {
      await updateTask(workspaceSlug, taskId, {
        listId: targetList.id,
        position: targetPosition,
        isCompleted,
      });

      await Promise.all([loadProject(), loadTaskOptions()]);
      onProjectUpdated?.();
    } catch (err) {
      setProject(previousProject);
      setTaskError(
        err instanceof Error
          ? err.message
          : "Unable to update task completion.",
      );

      await Promise.all([loadProject(), loadTaskOptions()]);
    } finally {
      setUpdatingTaskIds((ids) => ids.filter((id) => id !== taskId));
    }
  }

  async function handleTasksCreated() {
    setCreateTaskOpen(false);
    await Promise.all([loadProject(), loadTaskOptions()]);
  }

  async function handleLinkTasks() {
    if (!project || selectedTaskIds.length === 0) return;

    setLinkingTasks(true);
    setTaskError(null);

    try {
      await Promise.all(
        selectedTaskIds.map((taskId) =>
          updateTask(workspaceSlug, taskId, {
            projectId: project.id,
          }),
        ),
      );

      setSelectedTaskIds([]);
      await Promise.all([loadProject(), loadTaskOptions()]);
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Unable to link tasks.",
      );
      await Promise.all([loadProject(), loadTaskOptions()]);
    } finally {
      setLinkingTasks(false);
    }
  }

  async function handleUnlinkTask(taskId: string) {
    if (!project) return;

    setTaskError(null);
    setUpdatingTaskIds((ids) => [...ids, taskId]);

    try {
      await updateTask(workspaceSlug, taskId, {
        projectId: null,
      });

      await Promise.all([loadProject(), loadTaskOptions()]);
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Unable to unlink task.",
      );
    } finally {
      setUpdatingTaskIds((ids) => ids.filter((id) => id !== taskId));
    }
  }

  async function handleDeleteTask(taskId: string, taskTitle: string) {
    if (!project) return;

    const confirmed = window.confirm(
      `Delete "${taskTitle}" permanently? This will also remove it from Workspace Tasks.`,
    );

    if (!confirmed) return;

    setTaskError(null);
    setUpdatingTaskIds((ids) => [...ids, taskId]);

    try {
      await deleteTask(workspaceSlug, taskId);

      await Promise.all([loadProject(), loadTaskOptions()]);
    } catch (err) {
      setTaskError(
        err instanceof Error ? err.message : "Unable to delete task.",
      );
    } finally {
      setUpdatingTaskIds((ids) => ids.filter((id) => id !== taskId));
    }
  }

  const completedTasks =
    project?.completedTasks ??
    project?.tasks.filter((task) => task.isCompleted).length ??
    0;
  const totalTasks = project?.totalTasks ?? project?.tasks.length ?? 0;
  const progress =
    totalTasks === 0
      ? 0
      : Math.min(
          100,
          Math.max(
            0,
            project?.progress ??
              Math.round((completedTasks / totalTasks) * 100),
          ),
        );

  return (
    <>
      <Modal open={open} onClose={onClose} title="Project details">
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
          {loading && !project ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#737373]">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading project details...
            </div>
          ) : error && !project ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : project ? (
            <div className="grid min-h-0 min-w-0 flex-1 grid-cols-1 overflow-y-auto md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:overflow-hidden">
              <section className="min-h-0 min-w-0 overflow-y-auto px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words text-lg font-semibold text-[#20202A]">
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

                <div className="mt-2 flex flex-wrap gap-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${statusStyles[project.status as ProjectStatus]}`}
                  >
                    {statusLabels[project.status as ProjectStatus]}
                  </span>

                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${priorityStyles[project.priority]}`}
                  >
                    {priorityLabels[project.priority]} priority
                  </span>
                </div>

                <div className="mt-4 rounded-xl border border-[#E8EEE9] bg-[#FAFCFA] p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-medium text-[#696B7C]">
                      Task progress
                    </span>
                    <span className="text-sm font-semibold tabular-nums text-[#168653]">
                      {progress}%
                    </span>
                  </div>

                  <div
                    role="progressbar"
                    aria-label="Project task completion"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={progress}
                    className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#E3EEE7]"
                  >
                    <div
                      className="h-full rounded-full bg-[#168653] transition-[width] duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>

                  <p className="mt-1.5 text-xs text-[#77798A]">
                    {completedTasks} of {totalTasks} tasks completed
                  </p>
                </div>

                <div className="mt-4">
                  <h3 className="text-sm font-semibold text-[#353541]">
                    Description
                  </h3>
                  <p className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-5 text-[#646471]">
                    {project.description || "No description provided."}
                  </p>
                </div>

                <div className="mt-4 space-y-3 border-t border-[#ECECE7] pt-3">
                  <div className="flex items-start gap-2.5">
                    <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-[#777784]" />
                    <div>
                      <p className="text-xs text-[#777784]">Client</p>
                      <p className="mt-0.5 text-sm text-[#292934]">
                        {project.clientName || "No client assigned"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-[#777784]" />
                    <div>
                      <p className="text-xs text-[#777784]">Timeline</p>
                      <p className="mt-0.5 text-sm text-[#292934]">
                        {formatDate(project.startDate)} —{" "}
                        {formatDate(project.deadline)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-[#777784]" />
                    <div>
                      <p className="text-xs text-[#777784]">Created by</p>
                      <p className="mt-0.5 text-sm text-[#292934]">
                        {project.createdBy?.name ?? "Unknown"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#92929D]">
                        {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="flex min-h-[240px] min-w-0 flex-col overflow-hidden border-t border-[#ECECE7] md:min-h-0 md:border-l md:border-t-0">
                <div className="flex shrink-0 flex-col gap-3 border-b border-[#ECECE7] px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FolderKanban className="h-4 w-4 text-[#168653]" />

                    <h3 className="text-sm font-semibold text-[#292934]">
                      Project tasks
                    </h3>

                    <span className="rounded-full bg-[#E7F5EF] px-2 py-0.5 text-xs text-[#168653]">
                      {totalTasks}
                    </span>

                    <div className="flex-1" />

                    <button
                      type="button"
                      onClick={() => setCreateTaskOpen(true)}
                      disabled={taskLists.length === 0 || loadingTaskOptions}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#168653] px-2.5 py-1.5 text-xs font-medium text-white transition hover:bg-[#116D43] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Create task
                    </button>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      aria-label="Task list for new tasks"
                      value={selectedListId}
                      onChange={(event) =>
                        setSelectedListId(event.target.value)
                      }
                      disabled={loadingTaskOptions || taskLists.length === 0}
                      className="h-9 min-w-0 flex-1 rounded-lg border border-[#DEDFE8] bg-white px-2.5 text-xs text-[#292934] outline-none focus:border-[#168653]"
                    >
                      {taskLists.length === 0 && (
                        <option value="">No task lists available</option>
                      )}

                      {taskLists.map((list) => (
                        <option key={list.id} value={list.id}>
                          {list.name}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => void handleLinkTasks()}
                      disabled={
                        loadingTaskOptions ||
                        linkingTasks ||
                        selectedTaskIds.length === 0
                      }
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-[#D8E7DD] px-3 text-xs font-medium text-[#168653] transition hover:bg-[#F0F8F3] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {linkingTasks ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Link2 className="h-3.5 w-3.5" />
                      )}
                      Add selected ({selectedTaskIds.length})
                    </button>
                  </div>

                  {loadingTaskOptions ? (
                    <p className="text-xs text-[#777784]">
                      Loading workspace tasks...
                    </p>
                  ) : availableTasks.length > 0 ? (
                    <div className="max-h-32 space-y-1 overflow-y-auto rounded-lg border border-[#ECECE7] p-2">
                      <p className="mb-1 text-[11px] font-medium text-[#777784]">
                        Existing unlinked tasks
                      </p>

                      {availableTasks.map((task) => (
                        <label
                          key={task.id}
                          className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1.5 hover:bg-[#F7F9F7]"
                        >
                          <input
                            type="checkbox"
                            checked={selectedTaskIds.includes(task.id)}
                            onChange={(event) => {
                              setSelectedTaskIds((current) =>
                                event.target.checked
                                  ? [...current, task.id]
                                  : current.filter((id) => id !== task.id),
                              );
                            }}
                            className="h-3.5 w-3.5 accent-[#168653]"
                          />

                          <span className="min-w-0 flex-1 truncate text-xs text-[#353541]">
                            {task.title}
                          </span>

                          <span className="shrink-0 text-[10px] text-[#858591]">
                            {task.list?.name ?? "Task"}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#858591]">
                      No unlinked workspace tasks available.
                    </p>
                  )}
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
                  {taskError && (
                    <p
                      role="alert"
                      className="mb-3 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-700"
                    >
                      {taskError}
                    </p>
                  )}

                  {project.tasks.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center px-4 py-8 text-center">
                      <FolderKanban className="h-6 w-6 text-[#168653]" />
                      <p className="mt-2 text-sm font-medium text-[#353541]">
                        No tasks linked yet
                      </p>
                      <p className="mt-1 text-xs leading-5 text-[#858591]">
                        Tasks associated with this project will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {project.tasks.map((task) => {
                        const updating = updatingTaskIds.includes(task.id);

                        return (
                          <article
                            key={task.id}
                            className={`rounded-xl border p-3 transition ${
                              task.isCompleted
                                ? "border-[#D7EBDD] bg-[#FAFCFA]"
                                : "border-[#E5E7EB] bg-white"
                            }`}
                          >
                            <div className="flex items-start gap-2.5">
                              <button
                                type="button"
                                aria-label={
                                  task.isCompleted
                                    ? `Mark ${task.title} incomplete`
                                    : `Mark ${task.title} complete`
                                }
                                aria-pressed={task.isCompleted}
                                disabled={updating}
                                onClick={() =>
                                  void handleTaskCompletion(
                                    task.id,
                                    !task.isCompleted,
                                  )
                                }
                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition disabled:cursor-wait disabled:opacity-60 ${
                                  task.isCompleted
                                    ? "border-[#168653] bg-[#168653] text-white"
                                    : "border-[#C8CCD0] bg-white text-transparent hover:border-[#168653]"
                                }`}
                              >
                                {updating ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : task.isCompleted ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : null}
                              </button>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`break-words text-sm font-medium ${
                                    task.isCompleted
                                      ? "text-[#858797] line-through"
                                      : "text-[#292934]"
                                  }`}
                                >
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
                                  <p className="mt-1.5 text-xs text-[#777784]">
                                    Due {formatDate(task.dueDate)}
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                title="Remove from project"
                                aria-label={`Remove ${task.title} from project`}
                                disabled={updating}
                                onClick={() => void handleUnlinkTask(task.id)}
                                className="mt-0.5 shrink-0 rounded-lg p-1.5 text-[#777784] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {updating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Unlink className="h-4 w-4" />
                                )}
                              </button>

                              <button
                                type="button"
                                title="Delete task permanently"
                                aria-label={`Delete ${task.title}`}
                                disabled={updating}
                                onClick={() =>
                                  void handleDeleteTask(task.id, task.title)
                                }
                                className="mt-0.5 shrink-0 rounded-lg p-1.5 text-[#777784] transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-[#777784]">
              Project not found.
            </div>
          )}
        </div>
      </Modal>

      <CreateTaskModal
        open={createTaskOpen}
        workspaceSlug={workspaceSlug}
        listId={selectedListId}
        projectId={projectId ?? undefined}
        onClose={() => setCreateTaskOpen(false)}
        onCreated={() => void handleTasksCreated()}
      />
    </>
  );
}
