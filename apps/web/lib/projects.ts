import { api } from "./api";

export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "IN_REVIEW"
  | "READY_FOR_DELIVERY"
  | "COMPLETED"
  | "ARCHIVED";

export type ProjectPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  clientName: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string | null;
  deadline: string | null;
  workspaceId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;

  progress: number;
  totalTasks: number;
  completedTasks: number;

  _count?: {
    tasks: number;
  };
  createdBy?: {
    id: string;
    name: string;
    avatar: string | null;
  };
}

export interface ProjectTask {
  id: string;
  title: string;
  description: string | null;
  priority: ProjectPriority;
  dueDate: string | null;
  assigneeId: string | null;
  assignee: {
    id: string;
    name: string;
    avatar: string | null;
  } | null;
}

export interface ProjectDetails extends Project {
  tasks: ProjectTask[];
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
  clientName?: string;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  startDate?: string;
  deadline?: string;
}

export type UpdateProjectPayload = Partial<CreateProjectPayload>;

async function request<T>(
  endpoint: string,
  options: RequestInit,
): Promise<T> {
  return api<T>(endpoint, options);
}

export function getProjects(workspaceSlug: string) {
  return request<Project[]>(`/workspaces/${workspaceSlug}/projects`, {
    method: "GET",
  });
}

export function getProject(
  workspaceSlug: string,
  projectId: string,
) {
  return request<ProjectDetails>(
    `/workspaces/${encodeURIComponent(workspaceSlug)}/projects/${encodeURIComponent(projectId)}`,
    { method: "GET" },
  );
}

export function createProject(
  workspaceSlug: string,
  data: CreateProjectPayload,
) {
  return request<Project>(`/workspaces/${workspaceSlug}/projects`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateProject(
  workspaceSlug: string,
  projectId: string,
  data: UpdateProjectPayload,
) {
  return request<Project>(
    `/workspaces/${workspaceSlug}/projects/${projectId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
  );
}

export function deleteProject(workspaceSlug: string, projectId: string) {
  return request<{ id: string }>(
    `/workspaces/${workspaceSlug}/projects/${projectId}`,
    { method: "DELETE" },
  );
}