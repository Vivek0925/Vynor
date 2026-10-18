"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import type {
  CreateProjectPayload,
  Project,
  ProjectPriority,
  ProjectStatus,
} from "@/lib/projects";

type Props = {
  open: boolean;
  project: Project | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (data: CreateProjectPayload) => Promise<void>;
};

const inputClass =
  "mt-1.5 h-10 w-full min-w-0 rounded-xl border border-[#E5E7EB] bg-white px-3 text-sm text-[#252638] outline-none transition focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10 disabled:opacity-60";

const labelClass = "text-sm font-medium text-[#454655]";

const statuses: { value: ProjectStatus; label: string }[] = [
  { value: "PLANNING", label: "Planning" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "IN_REVIEW", label: "In review" },
  { value: "READY_FOR_DELIVERY", label: "Ready for delivery" },
  { value: "COMPLETED", label: "Completed" },
  { value: "ARCHIVED", label: "Archived" },
];

const priorities: { value: ProjectPriority; label: string }[] = [
  { value: "LOW", label: "Low" },
  { value: "MEDIUM", label: "Medium" },
  { value: "HIGH", label: "High" },
  { value: "URGENT", label: "Urgent" },
];

function dateInputValue(value: string | null | undefined) {
  return value ? value.slice(0, 10) : "";
}

export default function ProjectFormModal({
  open,
  project,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clientName, setClientName] = useState("");
  const [status, setStatus] = useState<ProjectStatus>("PLANNING");
  const [priority, setPriority] = useState<ProjectPriority>("MEDIUM");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(project?.name ?? "");
    setDescription(project?.description ?? "");
    setClientName(project?.clientName ?? "");
    setStatus(project?.status ?? "PLANNING");
    setPriority(project?.priority ?? "MEDIUM");
    setStartDate(dateInputValue(project?.startDate));
    setDeadline(dateInputValue(project?.deadline));
    setValidationError("");
  }, [open, project]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, saving, onClose]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (startDate && deadline && deadline < startDate) {
      setValidationError("Deadline cannot be earlier than the start date.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      clientName: clientName.trim() || undefined,
      status,
      priority,
      startDate: startDate || undefined,
      deadline: deadline || undefined,
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="my-auto flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E8E8EF] bg-white shadow-2xl sm:max-h-[calc(100dvh-40px)]"
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#ECEEF3] px-5 py-3.5 sm:px-6">
          <div>
            <h2
              id="project-form-title"
              className="text-lg font-semibold tracking-tight text-[#252638]"
            >
              {project ? "Edit project" : "Create project"}
            </h2>
            <p className="mt-0.5 text-sm text-[#858797]">
              {project
                ? "Update the details for this project."
                : "Add a new project to this workspace."}
            </p>
          </div>

          <button
            type="button"
            aria-label="Close modal"
            disabled={saving}
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[#77798A] transition hover:bg-[#F3F5F4] hover:text-[#252638] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="min-h-0 space-y-4 overflow-y-auto px-5 py-4 sm:px-6 sm:py-5"
        >
          <div>
            <label htmlFor="project-name" className={labelClass}>
              Project name *
            </label>
            <input
              id="project-name"
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter project name"
              required
              maxLength={120}
              autoFocus
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="project-description" className={labelClass}>
              Description
            </label>
            <textarea
              id="project-description"
              className="mt-1.5 min-h-[76px] w-full resize-y rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm text-[#252638] outline-none transition placeholder:text-[#999AA7] focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10 disabled:opacity-60"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Add some details..."
              rows={2}
              disabled={saving}
            />
          </div>

          <div>
            <label htmlFor="project-client" className={labelClass}>
              Client name
            </label>
            <input
              id="project-client"
              className={inputClass}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Enter client name"
              disabled={saving}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="project-status" className={labelClass}>
                Status
              </label>
              <select
                id="project-status"
                className={inputClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProjectStatus)
                }
                disabled={saving}
              >
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="project-priority" className={labelClass}>
                Priority
              </label>
              <select
                id="project-priority"
                className={inputClass}
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as ProjectPriority)
                }
                disabled={saving}
              >
                {priorities.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="project-start-date" className={labelClass}>
                Start date
              </label>
              <input
                id="project-start-date"
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                disabled={saving}
              />
            </div>

            <div>
              <label htmlFor="project-deadline" className={labelClass}>
                Deadline
              </label>
              <input
                id="project-deadline"
                type="date"
                className={inputClass}
                value={deadline}
                min={startDate || undefined}
                onChange={(event) => setDeadline(event.target.value)}
                disabled={saving}
              />
            </div>
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-red-600">
              {validationError}
            </p>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-[#ECEEF3] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="h-10 rounded-xl border border-[#E5E7EB] px-4 text-sm font-medium text-[#454655] transition hover:bg-[#F5F6F6] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="h-10 rounded-xl bg-[#168653] px-5 text-sm font-medium text-white transition hover:bg-[#117347] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : project
                  ? "Save changes"
                  : "Create project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}