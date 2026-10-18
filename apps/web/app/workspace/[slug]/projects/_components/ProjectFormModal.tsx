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
  "mt-1.5 h-10 w-full rounded-xl border border-[#E5E5EB] bg-white px-3 text-sm text-[#252638] outline-none transition focus:border-[#7777E8] focus:ring-2 focus:ring-[#7777E8]/10";

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

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    if (startDate && deadline && deadline < startDate) {
      setValidationError("Deadline cannot be earlier than the start date.");
      return;
    }

    const payload: CreateProjectPayload = {
      name: name.trim(),
      description: description.trim() || undefined,
      clientName: clientName.trim() || undefined,
      status,
      priority,
      startDate: startDate || undefined,
      deadline: deadline || undefined,
    };

    await onSubmit(payload);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="my-auto w-full max-w-xl rounded-2xl border border-[#E8E8EF] bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-[#EEEEF2] px-6 py-4">
          <div>
            <h2
              id="project-form-title"
              className="text-lg font-semibold text-[#252638]"
            >
              {project ? "Edit project" : "Create project"}
            </h2>
            <p className="mt-1 text-sm text-[#77798A]">
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
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#77798A] transition hover:bg-[#F3F3F8] disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label
              htmlFor="project-name"
              className="text-sm font-medium text-[#454655]"
            >
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
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="text-sm font-medium text-[#454655]"
            >
              Description
            </label>
            <textarea
              id="project-description"
              className="mt-1.5 min-h-24 w-full resize-y rounded-xl border border-[#E5E5EB] bg-white p-3 text-sm text-[#252638] outline-none transition focus:border-[#7777E8] focus:ring-2 focus:ring-[#7777E8]/10"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="What is this project about?"
              rows={3}
            />
          </div>

          <div>
            <label
              htmlFor="project-client"
              className="text-sm font-medium text-[#454655]"
            >
              Client name
            </label>
            <input
              id="project-client"
              className={inputClass}
              value={clientName}
              onChange={(event) => setClientName(event.target.value)}
              placeholder="Enter client name"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="project-status"
                className="text-sm font-medium text-[#454655]"
              >
                Status
              </label>
              <select
                id="project-status"
                className={inputClass}
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as ProjectStatus)
                }
              >
                {statuses.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="project-priority"
                className="text-sm font-medium text-[#454655]"
              >
                Priority
              </label>
              <select
                id="project-priority"
                className={inputClass}
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as ProjectPriority)
                }
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
              <label
                htmlFor="project-start-date"
                className="text-sm font-medium text-[#454655]"
              >
                Start date
              </label>
              <input
                id="project-start-date"
                type="date"
                className={inputClass}
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
              />
            </div>

            <div>
              <label
                htmlFor="project-deadline"
                className="text-sm font-medium text-[#454655]"
              >
                Deadline
              </label>
              <input
                id="project-deadline"
                type="date"
                className={inputClass}
                value={deadline}
                min={startDate || undefined}
                onChange={(event) => setDeadline(event.target.value)}
              />
            </div>
          </div>

          {validationError && (
            <p role="alert" className="text-sm text-red-600">
              {validationError}
            </p>
          )}

          <div className="flex justify-end gap-3 border-t border-[#EEEEF2] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[#E5E5EB] px-4 py-2.5 text-sm font-medium text-[#454655] transition hover:bg-[#F7F7FA] disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="rounded-xl bg-[#5555D9] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#4444C5] disabled:cursor-not-allowed disabled:opacity-60"
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