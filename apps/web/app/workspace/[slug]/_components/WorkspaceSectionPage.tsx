import type React from "react";

type WorkspaceSectionPageProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  contentClassName?: string;
  headerActions?: React.ReactNode;
};

export default function WorkspaceSectionPage({
  eyebrow,
  title,
  subtitle,
  children,
  contentClassName,
  headerActions,
}: WorkspaceSectionPageProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] shadow-[0_12px_32px_rgba(20,20,28,0.05)] sm:rounded-[24px] lg:rounded-[32px] fullscreen:!h-screen fullscreen:!w-screen fullscreen:!max-w-none fullscreen:!rounded-none fullscreen:!border-0">
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-4 py-3 sm:px-5 md:px-6 lg:px-7">
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--workspace-ink)] sm:text-[10px] sm:tracking-[0.22em]">
            {eyebrow}
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <h1 className="mt-0.5 truncate text-lg font-normal tracking-[-0.035em] text-[var(--workspace-ink)] sm:text-xl md:text-[22px]">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-[13px] text-[var(--workspace-muted)]">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {headerActions && (
          <div className="flex shrink-0 items-center gap-2">
            {headerActions}
          </div>
        )}
      </header>

      <div
        className={`min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 sm:px-4 sm:pb-4 md:px-6 md:pb-6 lg:px-7 ${
          contentClassName ?? ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}
