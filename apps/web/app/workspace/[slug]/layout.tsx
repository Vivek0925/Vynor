
import type { Metadata } from "next";
import WorkspaceShell from "./_components/WorkspaceShell";
import WorkspaceSocket from "./_components/WorkspaceSocket";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return (
    <>
      <WorkspaceSocket workspaceSlug={slug} />
      <WorkspaceShell>{children}</WorkspaceShell>
    </>
  );
}
