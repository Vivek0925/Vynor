"use client";

import { useMemo, useState } from "react";

import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import ProjectsGrid from "./_components/ProjectsGrid";
import ProjectsToolbar from "./_components/ProjectsToolbar";
import ProjectCard from "./_components/ProjectCard";


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
      { }
    </WorkspaceSectionPage>
  );
}