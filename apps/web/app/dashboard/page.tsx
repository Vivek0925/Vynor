"use client";
import { useAuth } from "@/context/AuthContext";
import { RequireAuth } from "@/components/auth/AuthRedirect";
import { useWorkspaces } from "@/app/hooks/useWorkspaces";
import { DashboardHeader, Hero, WorkspaceHistory } from "./components";

// export const metadata = {
//   title: "Dashboard | Forge",
//   description:
//     "Manage workspaces, launch a quick meeting room, and review recent project activity.",
// };

export default function Dashboard() {
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
        <main className="min-h-screen overflow-hidden bg-surface text-ink">
          <div className="rounded-b-[clamp(2rem,6vw,5rem)] bg-sage">
            <DashboardHeader onInvitationAccepted={addWorkspace} />
            <section className="relative flex min-h-[calc(100svh-4.5rem)] items-center justify-center overflow-hidden px-6 py-10 sm:py-16">
              <Hero user={user} onWorkspaceCreated={addWorkspace} />
            </section>
          </div>

          <section className="px-6 py-14 sm:py-20">
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
