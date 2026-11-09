"use client";

import { CalendarDays, Clock, Users, Video, MoreVertical } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Meeting {
  id: string;
  title: string;
  meetingCode: string;
  description?: string | null;
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  scheduledAt?: string | null;
  createdAt: string;

  createdBy: {
    id: string;
    name: string;
    avatar?: string | null;
  };

  participants: {
    id: string;
    user: {
      id: string;
      name: string;
      avatar?: string | null;
    };
  }[];
}

interface MeetingCardProps {
  meeting: Meeting;
  onJoin: (meetingId: string) => void;
  onEdit: (meeting: Meeting) => void;
  onCancel: (meetingId: string) => void;
}

export default function MeetingCard({
  meeting,
  onJoin,
  onEdit,
  onCancel,
}: MeetingCardProps) {
  const isActive = meeting.status === "ACTIVE";
  const isEnded = meeting.status === "ENDED";

  const [showMenu, setShowMenu] = useState(false);

  const { user } = useAuth();
  const isCreator = user?.id === meeting.createdBy.id;

  const scheduledDate = meeting.scheduledAt
    ? new Date(meeting.scheduledAt)
    : null;

  return (
    <div className="rounded-2xl border border-[var(--workspace-line)] bg-[var(--workspace-meeting-tint)] p-4 shadow-[0_10px_30px_rgba(23,32,26,0.04)] transition hover:shadow-[0_16px_40px_rgba(23,32,26,0.07)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[var(--workspace-surface)] sm:h-12 sm:w-12">
          <Video size={21} className="text-[var(--workspace-ink)]" />
          </div>

          <div>
            <h3 className="break-words text-lg font-medium text-[var(--workspace-ink)]">
              {meeting.title}
            </h3>

            {meeting.description && (
              <p className="mt-1 max-w-xl text-sm leading-6 text-[var(--workspace-muted)]">
                {meeting.description}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--workspace-muted)]">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {meeting.participants.length}{" "}
                {meeting.participants.length === 1
                  ? "participant"
                  : "participants"}
              </span>

              {scheduledDate && (
                <span className="flex items-center gap-1.5">
                  <CalendarDays size={14} />

                  {scheduledDate.toLocaleDateString([], {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              )}

              {scheduledDate && (
                <span className="flex items-center gap-1.5">
                  <Clock size={14} />

                  {scheduledDate.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}

              <span
                className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isActive
                    ? "bg-[var(--workspace-surface)] text-[var(--workspace-ink)]"
                    : isEnded
                      ? "bg-zinc-100 text-zinc-500"
                      : "bg-[var(--workspace-surface-secondary)] text-[var(--workspace-muted)]"
                }`}
              >
                {meeting.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col items-stretch gap-3 border-t border-[var(--workspace-line)] pt-3 sm:flex-row sm:items-center">
        <p className="text-xs text-[var(--workspace-muted)]">
          Created by{" "}
          <span className="font-medium text-[var(--workspace-ink)]">
            {meeting.createdBy.name}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:ml-auto sm:flex sm:items-center">
          {!isEnded && (
            <button
              type="button"
              onClick={() => onJoin(meeting.id)}
              className="flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-3 text-center text-xs font-medium text-[var(--workspace-ink)] transition hover:bg-[var(--workspace-coral-tint)] sm:px-4 sm:text-sm"
            >
              <Video size={16} />
              {isActive ? "Join Meeting" : "View Meeting"}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(
                `${window.location.origin}/meet/${meeting.meetingCode}`,
              );
            }}
            className="flex min-h-10 items-center justify-center gap-2 whitespace-nowrap rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-3 text-center text-xs font-medium text-[var(--workspace-ink)] transition hover:bg-[var(--workspace-coral-tint)] sm:px-4 sm:text-sm"
          >
            Copy Link
          </button>

          {meeting.status === "SCHEDULED" && isCreator && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowMenu((prev) => !prev)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-surface-secondary)] hover:text-[var(--workspace-ink)]"
                aria-label="Meeting options"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div className="absolute right-0 top-11 z-20 w-44 rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] p-1.5 shadow-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(meeting);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-[var(--workspace-ink)] transition hover:bg-[var(--workspace-bg)]"
                  >
                    Edit meeting
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowMenu(false);
                      onCancel(meeting.id);
                    }}
                    className="w-full rounded-lg px-3 py-2 text-left text-sm text-red-600 transition hover:bg-red-50"
                  >
                    Cancel meeting
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
