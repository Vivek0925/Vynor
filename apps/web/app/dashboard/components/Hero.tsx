"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bolt, Plus } from "lucide-react";
import { CreateWorkspaceModal } from "@/components/workspace";
import { api } from "@/lib/api";
import type { Workspace } from "@/lib/workspace";
import { useActiveMeeting } from "@/app/workspace/[slug]/_components/ActiveMeetingProvider";

type User = {
  name?: string | null;
};

interface HeroProps {
  user?: User | null;
  onWorkspaceCreated?: (workspace: Workspace) => void;
}

export default function Hero({ user, onWorkspaceCreated }: HeroProps) {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const [meetingCode, setMeetingCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { openMeeting } = useActiveMeeting();

  async function handleJoinMeeting() {
    const input = meetingCode.trim();
    let code = input;

    try {
      const url = new URL(input);
      const pathParts = url.pathname.split("/").filter(Boolean);
      code = pathParts.at(-1) ?? input;
    } catch {
      // Treat non-URL input as a meeting code.
    }

    if (!code) {
      setJoinError("Enter a meeting code.");
      return;
    }

    try {
      setJoining(true);
      setJoinError("");

      const data = await api<{
        meetingId: string;
        workspaceSlug: string;
        meetingCode: string;
        hostId: string;
      }>("/meetings/join-code", {
        method: "POST",
        body: JSON.stringify({ meetingCode: code }),
      });

      openMeeting({
        meetingId: data.meetingId,
        slug: data.workspaceSlug,
        meetingCode: data.meetingCode,
        hostId: data.hostId,
        source: "quick-join",
      });
    } catch (error) {
      setJoinError(
        error instanceof Error ? error.message : "Unable to join meeting.",
      );
    } finally {
      setJoining(false);
    }
  }

  async function handleQuickMeeting() {
    setJoinError("");

    try {
      setJoining(true);

      const data = await api<{
        meetingId: string;
        workspaceSlug: string;
        meetingCode: string;
        hostId: string;
      }>("/meetings/quick", { method: "POST" });

      openMeeting({
        meetingId: data.meetingId,
        slug: data.workspaceSlug,
        meetingCode: data.meetingCode,
        hostId: data.hostId,
        source: "quick-join",
      });
    } catch (error) {
      setJoinError(
        error instanceof Error
          ? error.message
          : "Unable to create quick meeting.",
      );
    } finally {
      setJoining(false);
    }
  }

  const firstName = user?.name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning," : hour < 18 ? "Good afternoon," : "Good evening,";

  return (
    <div className="flex w-full flex-col items-center justify-center text-center">
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-3 text-sm text-muted"
      >
        {new Date().toLocaleDateString(undefined, {
          weekday: "long",
          day: "numeric",
          month: "long",
        })}
      </motion.p>
      <motion.h1
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="max-w-[800px] text-[38px] font-medium leading-[1.05] tracking-[-0.06em] text-ink sm:text-[54px] md:text-[64px]"
      >
        {greeting} <span className="font-light">{firstName}.</span>
      </motion.h1>
      <motion.p
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        className="mx-auto mt-4 max-w-[520px] text-[15px] leading-[1.5] text-muted"
      >
        Create a workspace for your project, jump into a quick meeting, or join
        one using a code.
      </motion.p>

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24 }}
        className="mt-6 flex w-full max-w-[600px] flex-wrap justify-center gap-3"
      >
        <button
          onClick={() => setOpen(true)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-coral-dark"
        >
          <Plus className="h-4 w-4" />
          Create workspace
        </button>
        <button
          type="button"
          onClick={handleQuickMeeting}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-ink/30 px-6 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white"
        >
          <Bolt className="h-4 w-4" />
          Quick meeting
        </button>
      </motion.div>

      <motion.form
        initial={reduceMotion ? false : { opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        onSubmit={(event) => {
          event.preventDefault();
          void handleJoinMeeting();
        }}
        className="mt-3 flex w-full max-w-[520px] gap-2"
      >
          <input
            type="text"
            value={meetingCode}
            onChange={(event) => {
              setMeetingCode(event.target.value);
              setJoinError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                void handleJoinMeeting();
              }
            }}
            placeholder="Enter a code or meeting link"
            className="h-11 min-w-0 flex-1 rounded-full border border-ink/20 bg-white px-5 text-sm text-ink placeholder:text-muted focus:border-ink focus:outline-none"
          />
          <button
            type="button"
            onClick={() => void handleJoinMeeting()}
            disabled={joining}
            className="h-11 rounded-full bg-ink px-6 text-sm font-semibold text-text-warm transition hover:bg-forest disabled:cursor-not-allowed disabled:opacity-40"
          >
            {joining ? "Joining..." : "Join"}
          </button>
      </motion.form>

      {joinError && (
        <p className="mt-2 px-4 text-left text-sm text-red-500">{joinError}</p>
      )}

      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="mt-9 flex h-[210px] w-[210px] items-center justify-center rounded-full bg-sage p-7 text-ink sm:h-[280px] sm:w-[280px] sm:p-9"
        aria-hidden="true"
      >
        <svg viewBox="0 0 300 300" className="h-full w-full" fill="none">
          <circle cx="150" cy="150" r="140" fill="var(--cream-panel)" stroke="var(--forest-light)" strokeWidth="1.5" />
          <circle cx="150" cy="150" r="100" stroke="currentColor" strokeOpacity=".35" />
          <circle cx="150" cy="150" r="76" stroke="currentColor" strokeOpacity=".35" />
          <circle cx="118" cy="132" r="18" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="182" cy="132" r="18" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="118" cy="132" r="6" fill="currentColor" />
          <circle cx="182" cy="132" r="6" fill="currentColor" />
          <circle cx="98" cy="166" r="9" fill="var(--coral)" opacity=".55" />
          <circle cx="202" cy="166" r="9" fill="var(--coral)" opacity=".55" />
          <path d="M112 170 Q150 196 188 170" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="150" cy="50" r="7" fill="var(--coral)" />
        </svg>
      </motion.div>

      <CreateWorkspaceModal
        open={open}
        onOpenChange={setOpen}
        onCreated={onWorkspaceCreated}
      />
    </div>
  );
}
