interface DateSeparatorProps {
  date: string;
}

export default function DateSeparator({ date }: DateSeparatorProps) {
  const messageDate = new Date(date);

  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  let label = messageDate.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  if (messageDate.toDateString() === today.toDateString()) {
    label = "Today";
  } else if (messageDate.toDateString() === yesterday.toDateString()) {
    label = "Yesterday";
  }

  return (
    <div className="my-6 flex items-center gap-3 sm:my-8 sm:gap-4">
      <div className="h-px flex-1 bg-[#ECEEF3]" />

      <span className="rounded-full bg-white px-3 py-1 text-[11px] font-medium text-[#707A73] sm:px-4 sm:text-xs">
        {label}
      </span>

      <div className="h-px flex-1 bg-[#ECEEF3]" />
    </div>
  );
}
