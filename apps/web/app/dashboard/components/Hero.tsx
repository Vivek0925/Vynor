"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Bolt, Plus } from "lucide-react";
import { CreateWorkspaceModal } from "@/components/workspace";
import { useToast } from "@/components/ui/Toast";
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
  const [blink, setBlink] = useState(false);
  const [happy, setHappy] = useState(false);
  const [bounce, setBounce] = useState(false);
  const faceRef = useRef<SVGSVGElement>(null);
  const pupilOneRef = useRef<SVGCircleElement>(null);
  const pupilTwoRef = useRef<SVGCircleElement>(null);
  const { showToast } = useToast();

  const [meetingCode, setMeetingCode] = useState("");
  const [joining, setJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const { openMeeting } = useActiveMeeting();

  useEffect(() => {
    if (reduceMotion) return;

    const blinkTimer = window.setInterval(() => {
      setBlink(true);
      window.setTimeout(() => setBlink(false), 150);
    }, 4500);

    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    function animateEyes() {
      current.x += (target.x - current.x) * 0.18;
      current.y += (target.y - current.y) * 0.18;
      pupilOneRef.current?.setAttribute("cx", String(118 + current.x));
      pupilOneRef.current?.setAttribute("cy", String(132 + current.y));
      pupilTwoRef.current?.setAttribute("cx", String(182 + current.x));
      pupilTwoRef.current?.setAttribute("cy", String(132 + current.y));
      frame = window.requestAnimationFrame(animateEyes);
    }

    function handlePointerMove(event: PointerEvent) {
      const face = faceRef.current;
      if (!face) return;
      const bounds = face.getBoundingClientRect();
      const distance = Math.min(
        14,
        Math.hypot(
          event.clientX - (bounds.left + bounds.width / 2),
          event.clientY - (bounds.top + bounds.height / 2),
        ) / 40,
      );
      const angle = Math.atan2(
        event.clientY - (bounds.top + bounds.height / 2),
        event.clientX - (bounds.left + bounds.width / 2),
      );
      target.x = Math.cos(angle) * distance;
      target.y = Math.sin(angle) * distance;
    }

    function handleInputFocus() {
      const face = faceRef.current;
      const input = document.getElementById("meeting-code");
      if (!face || !input) return;
      const faceBounds = face.getBoundingClientRect();
      const inputBounds = input.getBoundingClientRect();
      const x = inputBounds.left + inputBounds.width / 2;
      const y = inputBounds.top + inputBounds.height / 2;
      const angle = Math.atan2(
        y - (faceBounds.top + faceBounds.height / 2),
        x - (faceBounds.left + faceBounds.width / 2),
      );
      const distance = Math.min(
        14,
        Math.hypot(
          x - (faceBounds.left + faceBounds.width / 2),
          y - (faceBounds.top + faceBounds.height / 2),
        ) / 40,
      );
      target.x = Math.cos(angle) * distance;
      target.y = Math.sin(angle) * distance;
    }

    frame = window.requestAnimationFrame(animateEyes);
    document.addEventListener("pointermove", handlePointerMove);
    document.getElementById("meeting-code")?.addEventListener("focus", handleInputFocus);
    return () => {
      window.clearInterval(blinkTimer);
      window.cancelAnimationFrame(frame);
      document.removeEventListener("pointermove", handlePointerMove);
      document.getElementById("meeting-code")?.removeEventListener("focus", handleInputFocus);
    };
  }, [reduceMotion]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target as HTMLElement;
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA"
      ) {
        return;
      }
      if (event.key.toLowerCase() === "n") {
        event.preventDefault();
        setOpen(true);
      } else if (event.key.toLowerCase() === "j") {
        event.preventDefault();
        document.getElementById("meeting-code")?.focus();
      }
    }

    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

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
      showToast({ message: `Joining ${data.meetingCode}...`, tone: "info" });
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
      celebrate();
      showToast({
        message: `Room ready: ${data.meetingCode}. Meeting opened.`,
        tone: "success",
        duration: 5000,
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

  function celebrate() {
    if (reduceMotion) return;
    setHappy(true);
    window.setTimeout(() => setHappy(false), 1800);
  }

  return (
    <div className="relative z-[1] flex w-full flex-col items-center justify-center text-center">
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
            id="meeting-code"
            value={meetingCode}
            onChange={(event) => {
              setMeetingCode(event.target.value);
              setJoinError("");
              setHappy(event.target.value.trim().length >= 4);
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
        className={`relative z-[2] mt-9 mb-[-105px] flex h-[210px] w-[210px] cursor-pointer items-center justify-center text-ink sm:mb-[-140px] sm:h-[280px] sm:w-[280px] ${bounce ? "dashboard-face-bounce" : ""}`}
        role="button"
        tabIndex={0}
        aria-label="Vynor assistant"
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setBounce(false);
            requestAnimationFrame(() => setBounce(true));
            window.setTimeout(() => setBounce(false), 600);
            showToast({ message: `Hi, ${firstName}.`, tone: "info" });
          }
        }}
        onClick={() => {
          setBounce(false);
          requestAnimationFrame(() => setBounce(true));
          window.setTimeout(() => setBounce(false), 600);
          showToast({ message: `Hi, ${firstName}.`, tone: "info" });
        }}
      >
        <svg ref={faceRef} viewBox="0 0 300 300" className="h-full w-full overflow-visible" fill="none">
          <circle cx="150" cy="150" r="140" fill="var(--cream-panel)" />
          <circle cx="150" cy="150" r="100" stroke="currentColor" strokeOpacity=".35" />
          <circle cx="150" cy="150" r="76" stroke="currentColor" strokeOpacity=".35" />
          <circle className="face-eye" cx="118" cy="132" r="18" fill="white" stroke="currentColor" strokeWidth="1.4" style={{ transformOrigin: "118px 132px", transform: blink ? "scaleY(.08)" : undefined }} />
          <circle className="face-eye" cx="182" cy="132" r="18" fill="white" stroke="currentColor" strokeWidth="1.4" style={{ transformOrigin: "182px 132px", transform: blink ? "scaleY(.08)" : undefined }} />
          <circle ref={pupilOneRef} cx="118" cy="132" r="6" fill="currentColor" />
          <circle ref={pupilTwoRef} cx="182" cy="132" r="6" fill="currentColor" />
          <circle cx="98" cy="166" r="9" fill="var(--coral)" opacity={happy ? ".55" : "0"} />
          <circle cx="202" cy="166" r="9" fill="var(--coral)" opacity={happy ? ".55" : "0"} />
          <path className="face-mouth" d="M112 170 Q150 196 188 170" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" style={{ transformOrigin: "150px 168px", transform: happy ? "scaleY(1.7)" : undefined, transition: "transform .4s cubic-bezier(.2,.9,.3,1.4)" }} />
          <g>
            <circle cx="150" cy="50" r="7" fill="var(--coral)" />
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="rotate"
              from="0 150 150"
              to="360 150 150"
              dur="18s"
              repeatCount="indefinite"
            />
          </g>
        </svg>
      </motion.div>

      <CreateWorkspaceModal
        key={open ? "workspace-open" : "workspace-closed"}
        open={open}
        onOpenChange={setOpen}
        onCreated={(workspace) => {
          onWorkspaceCreated?.(workspace);
          celebrate();
          showToast({ message: "Workspace created.", tone: "success" });
        }}
      />
    </div>
  );
}
