"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckSquare, FolderKanban } from "lucide-react";
import { getProjects, type Project } from "@/lib/projects";
import { getTaskLists, type TaskList } from "@/lib/tasks";
import { getWorkspaceMembers, type WorkspaceMember } from "@/lib/workspace";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import MyTasksCard from "./MyTasksCard";

type OverviewContentProps = { workspaceSlug: string };

type ActivityMeeting = {
  id: string;
  title: string;
  createdAt: string;
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
};

type Activity = {
  id: string;
  kind: "project" | "task" | "meeting";
  title: string;
  description: string;
  createdAt: string;
};

export default function OverviewContent({ workspaceSlug }: OverviewContentProps) {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [meetings, setMeetings] = useState<ActivityMeeting[]>([]);

  useEffect(() => {
    let active = true;
    Promise.all([
      getProjects(workspaceSlug),
      getTaskLists(workspaceSlug),
      getWorkspaceMembers(workspaceSlug),
      api<ActivityMeeting[]>(
        `/meetings/workspace/${encodeURIComponent(workspaceSlug)}/activity`,
      ),
    ])
      .then(([loadedProjects, loadedLists, loadedMembers, loadedMeetings]) => {
        if (!active) return;
        setProjects(loadedProjects);
        setLists(loadedLists);
        setMembers(loadedMembers);
        setMeetings(loadedMeetings);
      })
      .catch((error) => {
        console.error("Failed to load overview activity", error);
        if (!active) return;
        setProjects([]);
        setLists([]);
        setMembers([]);
        setMeetings([]);
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
  const activities = useMemo<Activity[]>(() => {
    const taskActivities = lists.flatMap((list) =>
      list.tasks.map((task) => ({
        id: `task-${task.id}`,
        kind: "task" as const,
        title: task.title,
        description: task.isCompleted ? "Task completed" : "Task created",
        createdAt: task.createdAt,
      })),
    );
    const projectActivities = projects.map((project) => ({
      id: `project-${project.id}`,
      kind: "project" as const,
      title: project.name,
      description: "Project created",
      createdAt: project.createdAt,
    }));
    const meetingActivities = meetings.map((meeting) => ({
      id: `meeting-${meeting.id}`,
      kind: "meeting" as const,
      title: meeting.title,
      description:
        meeting.status === "ACTIVE"
          ? "Meeting is live"
          : meeting.status === "ENDED"
            ? "Meeting ended"
            : meeting.status === "CANCELLED"
              ? "Meeting cancelled"
              : "Meeting created",
      createdAt: meeting.createdAt,
    }));

    return [...projectActivities, ...taskActivities, ...meetingActivities]
      .sort(
        (left, right) =>
          new Date(right.createdAt).getTime() -
          new Date(left.createdAt).getTime(),
      )
      .slice(0, 8);
  }, [lists, meetings, projects]);

  function formatActivityTime(value: string) {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  }

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
          {activities.length === 0 ? (
            <p className="mt-4 text-[13px] text-[var(--overview-muted)]">No recent activity to show.</p>
          ) : (
            <div className="scrollbar-none mt-4 max-h-80 space-y-4 overflow-y-auto pr-2">
              {activities.map((activity) => {
                const Icon =
                  activity.kind === "project"
                    ? FolderKanban
                    : activity.kind === "task"
                      ? CheckSquare
                      : CalendarDays;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--overview-surface)] text-[var(--overview-muted)]">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[13px] text-[var(--overview-ink)]">{activity.title}</p>
                      <p className="mt-0.5 text-[11px] text-[var(--overview-muted)]">
                        {activity.description} · {formatActivityTime(activity.createdAt)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <MyTasksCard workspaceSlug={workspaceSlug} />
      </div>
    </div>
  );
}
