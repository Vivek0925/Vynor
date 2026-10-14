import type React from "react";

type WorkspaceSectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
  contentClassName?: string;
  headerActions?: React.ReactNode;
};

export default function WorkspaceSectionPage({
  eyebrow,
  title,
  description,
  children,
  contentClassName,
  headerActions,
}: WorkspaceSectionPageProps) {
  return (
    <section className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-2xl border border-[#DEDFE8] bg-white shadow-[0_12px_32px_rgba(20,20,28,0.05)] sm:rounded-[24px] lg:rounded-[32px] fullscreen:!h-screen fullscreen:!w-screen fullscreen:!max-w-none fullscreen:!rounded-none fullscreen:!border-0">
      <header className="z-20 flex shrink-0 items-center justify-between gap-3 border-b border-[#ECEEF3] bg-white px-4 py-3 sm:px-5 md:px-6 lg:px-7">
        <div className="min-w-0">
          <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#059669] sm:text-[10px] sm:tracking-[0.22em]">
            {eyebrow}
          </div>

          <h1 className="mt-0.5 truncate text-lg font-light tracking-[-0.035em] text-[#14141C] sm:text-xl md:text-[22px]">
            {title}
          </h1>
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
