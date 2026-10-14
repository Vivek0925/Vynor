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
    <section className="flex h-full min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border border-[#DEDFE8] bg-white shadow-[0_18px_50px_rgba(20,20,28,0.06)] sm:rounded-[32px]">
      <header className="z-20 flex shrink-0 items-center justify-between gap-4 border-b border-[#ECEEF3] bg-white px-5 py-2.5 sm:px-6 md:px-7">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#059669]">
            {eyebrow}
          </div>

          <h1 className="mt-0.5 truncate text-[20px] font-light tracking-[-0.035em] text-[#14141C] sm:text-[22px]">
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
        className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-5 pb-5 sm:px-6 sm:pb-6 md:px-7 md:pb-7 ${
          contentClassName ?? ""
        }`}
      >
        {children}
      </div>
    </section>
  );
}