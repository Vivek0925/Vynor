 "use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import EmptyWorkspaceState from "./EmptyWorkspaceState";
import WorkspaceCard, {
  WorkspaceCardData,
} from "@/components/workspace/WorkspaceCard";

interface WorkspaceHistoryProps {
  user?: { name?: string | null } | null;
  workspaces: WorkspaceCardData[];
  onWorkspaceUpdated?: () => void;
  onWorkspaceDeleted?: () => void;
}

export default function WorkspaceHistory({
  user,
  workspaces,
  onWorkspaceUpdated,
  onWorkspaceDeleted,
}: WorkspaceHistoryProps) {
  const [filter, setFilter] = useState<"all" | "own" | "shared">("all");
  const reduceMotion = useReducedMotion();
  const visibleWorkspaces = workspaces.filter((workspace) => {
    if (filter === "all") return true;
    return filter === "own"
      ? workspace.status !== "Shared"
      : workspace.status === "Shared";
  });

  return (
    <div className="mx-auto max-w-[1440px]">
      <div className="mb-7 flex flex-col items-start gap-3 sm:mb-9 sm:gap-4">
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Workspace history
        </span>
        <div className="flex flex-col items-start gap-2 md:flex-row md:items-center md:justify-between md:gap-4">
          <h2 className="text-[34px] font-light tracking-[-0.05em] text-ink sm:text-[48px]">
            Recent workspaces
          </h2>
          <p className="text-sm leading-relaxed text-muted">
            {workspaces.length ? "Pick up where you left off." : "Create a workspace to see recent activity here."}
          </p>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter workspaces">
        {([
          ["all", "All"],
          ["own", "Created by me"],
          ["shared", "Shared"],
        ] as const).map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={filter === key}
            onClick={() => setFilter(key)}
            className="rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink transition hover:bg-cream aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-text-warm"
          >
            {label}
          </button>
        ))}
      </div>

      {visibleWorkspaces.length === 0 ? (
        <EmptyWorkspaceState user={user} />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleWorkspaces.map((workspace, index) => (
            <motion.div
              key={workspace.id}
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <WorkspaceCard
                workspace={workspace}
                onUpdated={() => onWorkspaceUpdated?.()}
                onDeleted={() => onWorkspaceDeleted?.()}
              />
            </motion.div>
          ))}
        </div>
      )}
      <p className="mt-7 text-xs text-muted">Press N for a new workspace, J to join with a code.</p>
    </div>
  );
}
