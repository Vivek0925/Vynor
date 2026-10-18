export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "READY_FOR_DELIVERY"
  | "COMPLETED"
  | "ARCHIVED";

export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type Project = {
  id: string;
  name: string;
  clientName: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  deadline: string;
  tasks: number;
};

export const statusOptions: {
  value: ProjectStatus | "ALL";
  label: string;
}[] = [
  { value: "ALL", label: "All projects" },
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "READY_FOR_DELIVERY", label: "Ready for delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

export const statusLabels: Record<ProjectStatus, string> = {
  PLANNING: "Planning",
  IN_PROGRESS: "In progress",
  IN_REVIEW: "In review",
  READY_FOR_DELIVERY: "Ready for delivery",
  COMPLETED: "Completed",
  ARCHIVED: "Archived",
};

export const statusStyles: Record<ProjectStatus, string> = {
  PLANNING: "bg-[#F2F2F5] text-[#5B5D6E]",
  IN_PROGRESS: "bg-[#E7F5EF] text-[#087F5B]",
  IN_REVIEW: "bg-[#FFF3D6] text-[#986500]",
  READY_FOR_DELIVERY: "bg-[#E8EDFF] text-[#4358A8]",
  COMPLETED: "bg-[#DDF5E7] text-[#176B43]",
  ARCHIVED: "bg-[#ECECF0] text-[#777887]",
};

export const priorityStyles: Record<ProjectPriority, string> = {
  LOW: "text-[#777887]",
  MEDIUM: "text-[#5B5D6E]",
  HIGH: "text-[#B7791F]",
  URGENT: "text-[#C24141]",
};

export function formatDate(value: string) {
  if (!value) return "Not set";

  return new Date(`${value}T12:00:00`).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDaysRemaining(deadline: string) {
  if (!deadline) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const due = new Date(`${deadline}T00:00:00`);

  if (due < today) return 0;

  return Math.ceil((due.getTime() - today.getTime()) / 86400000);
}