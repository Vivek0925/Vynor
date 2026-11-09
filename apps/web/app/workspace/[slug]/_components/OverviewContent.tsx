"use client";

import { useEffect, useState } from "react";
import { getProjects, type Project } from "@/lib/projects";
import { getTaskLists, type TaskList } from "@/lib/tasks";
import { getWorkspaceMembers, type WorkspaceMember } from "@/lib/workspace";
import { useAuth } from "@/context/AuthContext";
import MyTasksCard from "./MyTasksCard";

type OverviewContentProps = { workspaceSlug: string };

export default function OverviewContent({ workspaceSlug }: OverviewContentProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProjects(workspaceSlug),
      getTaskLists(workspaceSlug),
      getWorkspaceMembers(workspaceSlug),
    ])
      .then(([loadedProjects, loadedLists, loadedMembers]) => {
        if (!active) return;
        setProjects(loadedProjects);
        setLists(loadedLists);
        setMembers(loadedMembers);
      })
      .catch(() => {
        if (!active) return;
        setProjects([]);
        setLists([]);
        setMembers([]);
      });
    return () => {
      active = false;
    };
  }, [workspaceSlug]);

  const openTasks = lists.reduce(
    (count, list) => count + list.tasks.filter((task) => !task.isCompleted).length,
    0,
  );
  const firstName = user?.name?.split(/\s+/)[0] ?? "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="overview-theme">
      <h2 className="my-5 text-2xl font-normal tracking-[-0.04em] text-[var(--overview-ink)]">
        {greeting}, {firstName}
      </h2>
      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Projects", String(projects.length)],
          ["Open tasks", String(openTasks)],
          ["Members", String(members.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[24px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-5">
            <div className="text-[12px] font-medium uppercase tracking-[0.18em] text-[var(--overview-muted)]">{label}</div>
            <div className="mt-3 text-[30px] font-normal tracking-[-0.04em] text-[var(--overview-ink)]">{value}</div>
          </div>
        ))}
      </div>
      <div className="my-4 grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-[var(--overview-border)] bg-[var(--overview-surface-secondary)] p-6">
          <h2 className="text-[15px] font-medium text-[var(--overview-ink)]">Recent activity</h2>
          <p className="mt-4 text-[13px] text-[var(--overview-muted)]">No recent activity to show.</p>
        </div>
        <MyTasksCard workspaceSlug={workspaceSlug} />
      </div>
    </div>
  );
}
