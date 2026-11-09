"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Clock3,
  Loader2,
} from "lucide-react";

import { getMyTasks, type Task } from "@/lib/tasks";
import TaskDetailModal from "../tasks/_components/TaskDetailModal";

type MyTasksCardProps = {
  workspaceSlug: string;
};

function getPriorityLabel(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "Urgent";
    case "HIGH":
      return "High";
    case "MEDIUM":
      return "Medium";
    case "LOW":
      return "Low";
  }
}

function getPriorityClass(priority: Task["priority"]) {
  switch (priority) {
    case "URGENT":
      return "bg-[var(--overview-coral-tint)] text-[var(--overview-coral)]";
    case "HIGH":
      return "bg-[var(--overview-coral-tint)] text-[var(--overview-coral)]";
    case "MEDIUM":
      return "bg-[var(--overview-surface-secondary)] text-[var(--overview-muted)]";
    case "LOW":
      return "bg-[var(--overview-sage-tint)] text-[var(--overview-muted)]";
  }
}

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

function StatusIcon({ listName }: { listName: string }) {
  const normalized = listName.trim().toLowerCase();

  if (
    normalized === "done" ||
    normalized === "completed" ||
    normalized === "complete"
  ) {
    return <CheckCircle2 className="h-4 w-4 text-[var(--overview-muted)]" />;
  }

  if (
    normalized === "in progress" ||
    normalized === "in-progress" ||
    normalized === "doing"
  ) {
    return <Clock3 className="h-4 w-4 text-[var(--overview-muted)]" />;
  }

  return <Circle className="h-4 w-4 text-[var(--overview-muted)]" />;
}

export default function MyTasksCard({ workspaceSlug }: MyTasksCardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const requestIdRef = useRef(0);
  const [loadedSlug, setLoadedSlug] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      setLoading(true);

      const data = await getMyTasks(workspaceSlug);

      if (requestId === requestIdRef.current) {
        setTasks(data);
        setLoadedSlug(workspaceSlug);
      }
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error("Failed to load my tasks:", error);
        setTasks([]);
        setLoadedSlug(workspaceSlug);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [workspaceSlug]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  const visibleTasks = loadedSlug === workspaceSlug ? tasks : [];
  return (
    <div className="rounded-[28px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="text-[13px] font-medium uppercase tracking-[0.18em] text-[var(--overview-muted)]">
            My Tasks
          </div>

          <div className="mt-1 text-[13px] text-[var(--overview-muted)]">
            Tasks assigned to you
          </div>
        </div>

        {!loading && (
          <div className="rounded-full bg-[var(--overview-surface)] px-3 py-1 text-[12px] font-medium text-[var(--overview-muted)]">
            {visibleTasks.length}
          </div>
        )}
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-[var(--overview-muted)]" />
          </div>
        ) : visibleTasks.length === 0 ? (
          <div className="rounded-[20px] border border-dashed border-[var(--overview-border)] bg-[var(--overview-surface)] px-5 py-8 text-center">
            <div className="text-[14px] font-medium text-[var(--overview-ink)]">
              No tasks assigned to you
            </div>

            <div className="mt-1 text-[13px] text-[var(--overview-muted)]">
              You’re all caught up.
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleTasks.map((task) => (
              <button
                type="button"
                key={task.id}
                onClick={() => setSelectedTask(task)}
                className="flex w-full items-center gap-3 rounded-[18px] border border-[var(--overview-surface)] bg-[var(--overview-surface)] px-4 py-3 text-left shadow-[0_8px_20px_rgba(23,32,26,0.04)] transition hover:-translate-y-[1px] hover:shadow-[0_10px_24px_rgba(23,32,26,0.07)]"
              >
                <StatusIcon listName={task.list?.name ?? ""} />

                <div className="min-w-0 flex-1">
                  <div className="truncate text-[14px] font-medium text-[var(--overview-ink)]">
                    {task.title}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-[12px] text-[var(--overview-muted)]">
                    <span className="capitalize">
                      {task.list?.name ?? "Unknown list"}
                    </span>

                    <span>•</span>

                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>

                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-medium ${getPriorityClass(
                    task.priority,
                  )}`}
                >
                  {getPriorityLabel(task.priority)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
      <TaskDetailModal
        open={selectedTask !== null}
        task={selectedTask}
        workspaceSlug={workspaceSlug}
        onClose={() => setSelectedTask(null)}
        onUpdated={() => {
          setSelectedTask(null);
          void loadTasks();
        }}
      />
    </div>
  );
}
