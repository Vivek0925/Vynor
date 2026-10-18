"use client";

import { useMemo, useState } from "react";

import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";


import type { Project, ProjectStatus } from "./_lib/project-types";

export default function ProjectsPage() {
  // Manage project data, search, filters, and modal state here.
  // Pass data and callbacks to the components.

  return (
    <WorkspaceSectionPage
      eyebrow="Project management"
      title="Projects"
      description="Plan client work, track delivery, and keep every project moving."
    >
      {/* Compose the reusable components here */}
    </WorkspaceSectionPage>
  );
}