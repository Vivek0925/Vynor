
"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarDays } from "lucide-react";

import { api } from "@/lib/api";
import { socket } from "@/lib/socket";

type Meeting = {
  id: string;
  title: string;
  status: "SCHEDULED" | "ACTIVE" | "ENDED" | "CANCELLED";
  scheduledAt?: string | null;
};

export default function UpcomingMeetingsCard({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const loadMeetings = useCallback(async () => {
    try {
      setFailed(false);

      const data = await api<Meeting[]>(
        `/meetings/workspace/${workspaceSlug}`,
      );

      const now = Date.now();

      const upcoming = data
        .filter(
          (meeting) =>
            meeting.status === "SCHEDULED" &&
            meeting.scheduledAt &&
            new Date(meeting.scheduledAt).getTime() > now,
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledAt!).getTime() -
            new Date(b.scheduledAt!).getTime(),
        )
        .slice(0, 3);

      setMeetings(upcoming);
    } catch (error) {
      console.error("Failed to load upcoming meetings", error);
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [workspaceSlug]);

  useEffect(() => {
    if (!workspaceSlug) return;

    void loadMeetings();

    const handleMeetingChange = () => {
      void loadMeetings();
    };

    socket.on("meeting:created", handleMeetingChange);
    socket.on("meeting:updated", handleMeetingChange);
    socket.on("meeting:cancelled", handleMeetingChange);

    return () => {
      socket.off("meeting:created", handleMeetingChange);
      socket.off("meeting:updated", handleMeetingChange);
      socket.off("meeting:cancelled", handleMeetingChange);
    };
  }, [workspaceSlug, loadMeetings]);

  function formatMeetingDate(value: string) {
    const date = new Date(value);
    const today = new Date();
    const tomorrow = new Date();

    tomorrow.setDate(today.getDate() + 1);

    const sameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    let dayLabel: string;

    if (sameDay(date, today)) {
      dayLabel = "Today";
    } else if (sameDay(date, tomorrow)) {
      dayLabel = "Tomorrow";
    } else {
      dayLabel = date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    }

    const time = date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    return {
      month: date
        .toLocaleDateString("en-US", { month: "short" })
        .toUpperCase(),
      day: date.getDate(),
      time: `${dayLabel}, ${time}`,
    };
  }

  return (
    <div className="rounded-[28px] border border-[#DEDFE8] bg-[#FAFAF8] p-6">
      <div className="flex items-center gap-2 text-[13px] font-medium uppercase tracking-[0.18em] text-[#5B5D6E]">
        <CalendarDays size={16} />
        Upcoming meetings
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <p className="py-4 text-sm text-[#7A7D8C]">
            Loading upcoming meetings...
          </p>
        ) : failed ? (
          <p className="py-4 text-sm text-[#7A7D8C]">
            Could not load meetings. Please refresh the page.
          </p>
        ) : meetings.length === 0 ? (
          <p className="py-4 text-sm text-[#7A7D8C]">
            No upcoming meetings scheduled.
          </p>
        ) : (
          meetings.map((meeting) => {
            const date = formatMeetingDate(meeting.scheduledAt!);

            return (
              <div
                key={meeting.id}
                className="flex items-center gap-4 rounded-[20px] border border-white bg-white px-4 py-3 shadow-[0_8px_20px_rgba(20,20,28,0.04)]"
              >
                <div className="min-w-[52px] rounded-[16px] bg-[#EAFBF1] px-2 py-2 text-center leading-none text-[#065F46]">
                  <div className="text-[11px] font-medium">
                    {date.month}
                  </div>
                  <div className="mt-1 text-[18px] font-medium">
                    {date.day}
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="truncate text-[14px] font-medium text-[#14141C]">
                    {meeting.title}
                  </div>
                  <div className="mt-1 text-[13px] text-[#5B5D6E]">
                    {date.time}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
