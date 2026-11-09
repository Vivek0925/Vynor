"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Plus, Video, X } from "lucide-react";

import MeetingCard from "../components/MeetingCard";
import { api } from "@/lib/api";
import { useActiveMeeting } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";
import { socket } from "@/lib/socket";
import { ConfirmDialog } from "@/components/ui/ActionDialog";

interface Meeting {
  id: string;
  title: string;
  description?: string | null;
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  scheduledAt?: string | null;
  createdAt: string;
  meetingCode: string;

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

interface MeetingsProps {
  slug: string;
}

type MeetingMode = "now" | "scheduled";

export default function Meetings({ slug }: MeetingsProps) {
  const { openMeeting } = useActiveMeeting();
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  const [loading, setLoading] = useState(true);

  const [showCreate, setShowCreate] = useState(false);

  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);

  const [calendarConnected, setCalendarConnected] = useState(false);

  const [mode, setMode] = useState<MeetingMode>("now");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [scheduledAt, setScheduledAt] = useState("");

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");
  const [cancelMeetingId, setCancelMeetingId] = useState<string | null>(null);

  async function loadMeetings() {
    try {
      setLoading(true);
      setError("");

      const data = await api<Meeting[]>(`/meetings/workspace/${slug}`);

      setMeetings(data);
    } catch (error) {
      console.error("Failed to load meetings", error);

      setError("Failed to load meetings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!slug) return;

    loadMeetings();

    const onMeetingUpdated = () => {
      loadMeetings();
    };

    socket.on("meeting:updated", onMeetingUpdated);

    return () => {
      socket.off("meeting:updated", onMeetingUpdated);
    };
  }, [slug]);

  useEffect(() => {
    async function checkCalendarConnection() {
      try {
        const data = await api<{ connected: boolean }>(
          "/google-calendar/status",
        );
        setCalendarConnected(data.connected);
      } catch (error) {
        console.error("Failed to check Google Calendar connection", error);
      }
    }

    checkCalendarConnection();
  }, []);

  function resetForm() {
    setTitle("");
    setDescription("");
    setScheduledAt("");
    setMode("now");
    setError("");
  }

  function closeModal() {
    if (creating) return;

    setShowCreate(false);
    resetForm();
  }

  async function createMeeting() {
    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (mode === "scheduled" && !scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const meeting = await api<Meeting>(`/meetings/workspaces/${slug}`, {
        method: "POST",

        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,

          ...(mode === "scheduled"
            ? {
                scheduledAt: new Date(scheduledAt).toISOString(),
              }
            : {}),
        }),
      });

      if (mode === "now") {
        openMeeting({
          meetingId: meeting.id,
          slug,
          meetingCode: meeting.meetingCode,
          hostId: meeting.createdBy.id,
          source: "workspace",
        });
      } else {
        setMeetings((prev) => [meeting, ...prev]);
      }

      socket.emit("meeting:created", {
        meetingId: meeting.id,
        workspaceSlug: slug,
      });

      setShowCreate(false);
      resetForm();
    } catch (error) {
      console.error("Failed to create meeting", error);

      setError(
        error instanceof Error ? error.message : "Failed to create meeting.",
      );
    } finally {
      setCreating(false);
    }
  }

  function handleJoin(meetingId: string) {
    window.location.href = `/workspace/${slug}/meetings/${meetingId}`;
  }

  function handleEdit(meeting: Meeting) {
    setEditingMeeting(meeting);
    setTitle(meeting.title);
    setDescription(meeting.description ?? "");

    if (meeting.scheduledAt) {
      const date = new Date(meeting.scheduledAt);

      const localDate = new Date(
        date.getTime() - date.getTimezoneOffset() * 60000,
      );

      setScheduledAt(localDate.toISOString().slice(0, 16));
    }
  }

  async function handleCancel(meetingId: string) {
    setCancelMeetingId(meetingId);
  }

  async function confirmCancelMeeting() {
    if (!cancelMeetingId) return;

    const meetingId = cancelMeetingId;
    try {
      await api(`/meetings/${meetingId}/cancel`, {
        method: "POST",
      });

      socket.emit("meeting:cancelled", {
        meetingId,
        workspaceSlug: slug,
      });

      await loadMeetings();
      setCancelMeetingId(null);
    } catch (error) {
      console.error("Failed to cancel meeting", error);

      setError(
        error instanceof Error ? error.message : "Failed to cancel meeting.",
      );
    }
  }

  async function updateMeeting() {
    if (!editingMeeting) return;

    if (!title.trim()) {
      setError("Meeting title is required.");
      return;
    }

    if (!scheduledAt) {
      setError("Please select a date and time.");
      return;
    }

    try {
      setError("");

      await api(`/meetings/${editingMeeting.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          scheduledAt: new Date(scheduledAt).toISOString(),
        }),
      });

      socket.emit("meeting:updated", {
        meetingId: editingMeeting.id,
        workspaceSlug: slug,
      });

      setEditingMeeting(null);
      resetForm();

      await loadMeetings();
    } catch (error) {
      console.error("Failed to update meeting", error);

      setError(
        error instanceof Error ? error.message : "Failed to update meeting.",
      );
    }
  }

  const activeMeetings = meetings.filter(
    (meeting) => meeting.status === "ACTIVE",
  );

  const scheduledMeetings = meetings.filter(
    (meeting) => meeting.status === "SCHEDULED",
  );

  return (
    <div className="relative isolate flex h-full min-h-0 flex-col overflow-y-auto scrollbar-none overflow-x-hidden rounded-[22px] border border-[var(--workspace-line)] bg-[var(--workspace-surface)]">
      {/* Header */}

      <div className="sticky top-0 z-30 shrink-0 border-b border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="min-w-0">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--workspace-ink)]">
                Meetings
              </div>

              <h1 className="font-normal tracking-[-0.035em] text-[20px] text-[var(--workspace-ink)] sm:text-[22px]">
                Meetings
              </h1>
            </div>
          </div>

          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <button
              type="button"
              disabled={calendarConnected}
              onClick={() => {
                const returnTo = `/workspace/${slug}/meetings`;
                window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/google-calendar/connect?returnTo=${encodeURIComponent(returnTo)}`;
              }}
              className={`inline-flex min-h-10 min-w-0 items-center justify-center gap-1.5 rounded-xl border px-2 text-center text-[11px] font-medium leading-tight transition sm:h-10 sm:gap-2 sm:px-3 sm:text-sm ${
                calendarConnected
                  ? "cursor-default border-[var(--workspace-meeting-tint)] bg-[var(--workspace-meeting-tint)] text-[var(--workspace-ink)]"
                  : "border-[var(--workspace-line)] bg-[var(--workspace-surface)] text-[var(--workspace-ink)] hover:bg-[var(--workspace-bg)]"
              }`}
            >
              <CalendarDays size={16} />
              {calendarConnected ? "Calendar connected" : "Connect calendar"}
            </button>

            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="flex min-h-10 shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-xl bg-[var(--workspace-coral)] px-2 py-2.5 text-[11px] font-medium text-white transition hover:opacity-90 sm:gap-2 sm:px-4 sm:text-sm"
            >
              <Plus size={17} />
              New Meeting
            </button>
          </div>
        </div>
      </div>

      {/* Content */}

      <div className="relative z-0 flex-1 px-2 py-4 sm:px-8 sm:py-8">
        <div className="mx-auto max-w-6xl">
          {error && !showCreate && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center text-sm text-[var(--workspace-muted)]">
              Loading meetings...
            </div>
          ) : meetings.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl border border-dashed border-[var(--workspace-line)] bg-[var(--workspace-surface-secondary)] sm:min-h-[360px]">
              <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--workspace-meeting-tint)]">
                <Video size={30} className="text-[var(--workspace-ink)]" />
              </div>

              <h2 className="text-center text-xl font-medium text-[var(--workspace-ink)] sm:text-left">
                No active or upcoming meetings
              </h2>

              <p className="mt-2 max-w-md text-center text-sm leading-6 text-[var(--workspace-muted)]">
                Start an instant meeting or schedule one for later.
              </p>

              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="mt-6 flex items-center gap-2 rounded-xl  px-4 py-2.5 text-sm font-medium text-black transition hover:bg-[#30333E]/50"
              >
                <Plus size={17} />
                New Meeting
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Live */}

              {activeMeetings.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-3">
                    <span className="h-2.5 w-2.5 rounded-full bg-[var(--workspace-meeting-tint)]" />

                    <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--workspace-muted)]">
                      Live now
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {activeMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onJoin={handleJoin}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* Upcoming */}

              {scheduledMeetings.length > 0 && (
                <section>
                  <div className="mb-5 flex items-center gap-3">
                    <CalendarDays size={16} className="text-[var(--workspace-muted)]" />

                    <h2 className="text-sm font-medium uppercase tracking-wider text-[var(--workspace-muted)]">
                      Upcoming
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {scheduledMeetings.map((meeting) => (
                      <MeetingCard
                        key={meeting.id}
                        meeting={meeting}
                        onJoin={handleJoin}
                        onEdit={handleEdit}
                        onCancel={handleCancel}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Meeting Modal */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="my-auto max-h-[calc(100dvh-2rem)] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-5 shadow-2xl sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-medium text-[var(--workspace-ink)]">
                  New Meeting
                </h2>

                <p className="mt-1 text-sm text-[var(--workspace-muted)]">
                  Start now or schedule it for later.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl p-2 text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-bg)] hover:text-[var(--workspace-ink)] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--workspace-ink)]">
                  Meeting title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Weekly Engineering Sync"
                  className="w-full rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--workspace-ink)]">
                  Description
                  <span className="ml-1 font-normal text-[#A1A5B3]">
                    (optional)
                  </span>
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="What is this meeting about?"
                  className="w-full resize-none rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition placeholder:text-[var(--workspace-muted)] focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                />
              </div>

              {/* Meeting mode */}

              <div>
                <label className="mb-3 block text-sm font-medium text-[var(--workspace-ink)]">
                  When?
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("now")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      mode === "now"
                        ? "border-[var(--workspace-coral)] bg-[var(--workspace-coral-tint)]"
                        : "border-[var(--workspace-line)] bg-[var(--workspace-surface)] hover:bg-[var(--workspace-bg)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${
                          mode === "now"
                            ? "bg-[var(--workspace-coral)]"
                            : "border border-[var(--workspace-muted)]"
                        }`}
                      />

                      <span className="text-sm font-medium text-[var(--workspace-ink)]">
                        Start now
                      </span>
                    </div>

                    <p className="mt-2 pl-4 text-xs leading-5 text-[var(--workspace-muted)]">
                      Start the meeting immediately.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMode("scheduled")}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      mode === "scheduled"
                        ? "border-[var(--workspace-coral)] bg-[var(--workspace-coral-tint)]"
                        : "border-[var(--workspace-line)] bg-[var(--workspace-surface)] hover:bg-[var(--workspace-bg)]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarDays
                        size={15}
                        className={
                          mode === "scheduled"
                            ? "text-[var(--workspace-coral)]"
                            : "text-[var(--workspace-muted)]"
                        }
                      />

                      <span className="text-sm font-medium text-[var(--workspace-ink)]">
                        Schedule
                      </span>
                    </div>

                    <p className="mt-2 pl-6 text-xs leading-5 text-[var(--workspace-muted)]">
                      Pick a date and time.
                    </p>
                  </button>
                </div>
              </div>

              {/* Schedule date */}

              {mode === "scheduled" && (
                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--workspace-ink)]">
                    <CalendarDays size={15} />
                    Date and time
                  </label>

                  <input
                    type="datetime-local"
                    value={scheduledAt}
                    min={new Date().toISOString().slice(0, 16)}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    className="w-full rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                  />
                </div>
              )}

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}
            </div>

            {/* Actions */}

            <div className="mt-7 bg-none flex justify-end gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={creating}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-bg)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={createMeeting}
                disabled={
                  creating ||
                  !title.trim() ||
                  (mode === "scheduled" && !scheduledAt)
                }
                className="flex items-center gap-2 rounded-xl bg-[var(--workspace-coral)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Video size={16} />

                {creating
                  ? "Creating..."
                  : mode === "now"
                    ? "Start Meeting"
                    : "Schedule Meeting"}
              </button>
            </div>
          </div>
        </div>
      )}
      {editingMeeting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-[var(--workspace-surface)] p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-medium text-[var(--workspace-ink)]">
                  Edit Meeting
                </h2>

                <p className="mt-1 text-sm text-[var(--workspace-muted)]">
                  Update the meeting details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                className="rounded-xl p-2 text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-bg)] hover:text-[var(--workspace-ink)]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--workspace-ink)]">
                  Meeting title
                </label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[var(--workspace-ink)]">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                />
              </div>

              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-[var(--workspace-ink)]">
                  <CalendarDays size={15} />
                  Date and time
                </label>

                <input
                  type="datetime-local"
                  value={scheduledAt}
                  min={new Date().toISOString().slice(0, 16)}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 text-sm text-[var(--workspace-ink)] outline-none transition focus:border-[var(--workspace-coral)] focus:ring-2 focus:ring-[var(--workspace-coral-tint)]"
                />
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingMeeting(null)}
                className="rounded-xl px-4 py-2.5 text-sm font-medium text-[var(--workspace-muted)] transition hover:bg-[var(--workspace-bg)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={updateMeeting}
                className="rounded-xl bg-[var(--workspace-coral)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmDialog
        open={cancelMeetingId !== null}
        title="Cancel meeting?"
        description="This will cancel the meeting for everyone in the workspace."
        onClose={() => setCancelMeetingId(null)}
        onConfirm={() => void confirmCancelMeeting()}
        confirmLabel="Cancel meeting"
        destructive
      />
    </div>
  );
}
