"use client";

import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { statusOptions } from "../_lib/project-types";

type Props = {
  search: string;
  onSearchChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  onCreateProject: () => void;
};

export default function ProjectsToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  onCreateProject,
}: Props) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={17}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#858797]"
          />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search projects..."
            className="h-10 w-full rounded-xl border border-[#E5E5EB] bg-white pl-9 pr-3 text-sm text-[#242532] outline-none transition placeholder:text-[#999AA7] focus:border-[#7777E8] focus:ring-2 focus:ring-[#7777E8]/10"
          />
        </div>

        <div className="relative w-full sm:w-48">
          <SlidersHorizontal
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#858797]"
          />

          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
            className="h-10 w-full appearance-none rounded-xl border border-[#E5E5EB] bg-white pl-9 pr-3 text-sm text-[#454655] outline-none transition focus:border-[#7777E8] focus:ring-2 focus:ring-[#7777E8]/10"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={onCreateProject}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#168653] px-4 text-sm font-medium text-white transition hover:bg-[#116B43] focus:outline-none focus:ring-2 focus:ring-[#7777E8]/30"
      >
        <Plus size={17} />
        New project
      </button>
    </div>
  );
}