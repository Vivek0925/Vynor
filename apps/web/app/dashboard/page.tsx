"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useRef } from "react";
import { RequireAuth } from "@/components/auth/AuthRedirect";
import { useWorkspaces } from "@/app/hooks/useWorkspaces";
import { DashboardHeader, Hero, WorkspaceHistory } from "./components";

// export const metadata = {
//   title: "Dashboard | Forge",
//   description:
//     "Manage workspaces, launch a quick meeting room, and review recent project activity.",
// };

export default function Dashboard() {
  const bandRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerMove(event: PointerEvent) {
      const band = bandRef.current;
      const glow = glowRef.current;
      if (!band || !glow) return;
      const bounds = band.getBoundingClientRect();
      glow.style.transform = `translate(${event.clientX - bounds.left}px, ${event.clientY - bounds.top}px)`;
    }

    document.addEventListener("pointermove", handlePointerMove);
    return () => document.removeEventListener("pointermove", handlePointerMove);
  }, []);

  const { user, loading } = useAuth();
  const {
    workspaces,
    loading: workspacesLoading,
    addWorkspace,
    refresh,
  } = useWorkspaces();

  return (
    <RequireAuth>
      {loading || workspacesLoading ? (
        <div className="flex min-h-screen items-center justify-center bg-cream text-sm text-muted">
          Loading...
        </div>
      ) : (
        <main className="min-h-screen bg-surface text-ink">
          <div
            ref={bandRef}
            className="relative rounded-b-[clamp(2rem,6vw,5rem)] bg-sage"
          >
            <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-[inherit]">
              <div
                ref={glowRef}
                aria-hidden="true"
                className="absolute left-0 top-0 -ml-[230px] -mt-[230px] h-[460px] w-[460px] rounded-full bg-white/55 blur-[60px] transition-transform duration-500 ease-out"
                style={{ transform: "translate(50vw, 200px)" }}
              />
            </div>
            <DashboardHeader onInvitationAccepted={addWorkspace} />
            <section className="relative flex items-center justify-center px-6 pb-0 pt-8 sm:pt-14">
              <Hero user={user} onWorkspaceCreated={addWorkspace} />
            </section>
          </div>

          <section className="px-6 pb-14 pt-[140px] sm:pb-20 sm:pt-[190px]">
              <WorkspaceHistory
                user={user}
                workspaces={workspaces}
                onWorkspaceUpdated={() => void refresh()}
                onWorkspaceDeleted={() => void refresh()}
              />
          </section>
        </main>
      )}
    </RequireAuth>
  );
}
