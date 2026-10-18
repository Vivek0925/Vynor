import type {
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/projects";

export type { Project, ProjectPriority, ProjectStatus };

export const statusOptions = [
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

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not set";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getDaysRemaining(value: string | null | undefined) {
  if (!value) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const deadline = new Date(value);
  deadline.setHours(0, 0, 0, 0);

  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
}