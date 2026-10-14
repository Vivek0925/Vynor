type WorkspaceSectionPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
};

export default function WorkspaceSectionPage({
  eyebrow,
  title,
  description,
  children,
}: WorkspaceSectionPageProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden rounded-[24px] border border-[#DEDFE8] bg-white shadow-[0_18px_50px_rgba(20,20,28,0.06)] sm:rounded-[32px]">
      <div className="sticky top-0 z-20 shrink-0 border-b border-[#ECEEF3] bg-white/95 px-5 py-3 backdrop-blur-sm sm:px-6 sm:py-3.5 md:px-7">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#059669]">
          {eyebrow}
        </div>

        <h1 className="mt-0.5 text-[26px] font-light tracking-[-0.035em] text-[#14141C] sm:text-[28px] md:text-[30px]">
          {title}
        </h1>

       <p className="mt-1 text-[13px] leading-relaxed text-[#5B5D6E]">
          {description}
        </p>
      </div>

      <div className="min-h-0 px-5 pb-5 sm:px-6 sm:pb-6 md:px-7 md:pb-7">
  {children}
</div>
    </section>
  );
}