import { api } from "./api";

export interface WorkspaceFile {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  starred: boolean;
  createdAt: string;
  uploadedBy: { id: string; name: string };
}

export function getWorkspaceFiles(slug: string) {
  return api<WorkspaceFile[]>(
    `/storage/workspaces/${encodeURIComponent(slug)}/files`,
  );
}

export function uploadWorkspaceFile(slug: string, file: File) {
  const body = new FormData();
  body.append("file", file);
  body.append("folder", "documents");
  body.append("workspaceSlug", slug);
  return api<WorkspaceFile>("/storage/upload", { method: "POST", body });
}

export function toggleWorkspaceFileStar(slug: string, fileId: string) {
  return api<WorkspaceFile>(
    `/storage/workspaces/${encodeURIComponent(slug)}/files/${encodeURIComponent(fileId)}/star`,
    { method: "PATCH" },
  );
}

export function deleteWorkspaceFile(slug: string, fileId: string) {
  return api<void>(
    `/storage/workspaces/${encodeURIComponent(slug)}/files/${encodeURIComponent(fileId)}`,
    { method: "DELETE" },
  );
}

export function getWorkspaceFileDownloadUrl(slug: string, fileId: string) {
  return api<{ url: string }>(
    `/storage/workspaces/${encodeURIComponent(slug)}/files/${encodeURIComponent(fileId)}/download`,
  );
}

export function sendFileToConversation(
  slug: string,
  conversationId: string,
  file: WorkspaceFile,
) {
  const link =
    typeof window === "undefined"
      ? `/workspace/${slug}/files?file=${file.id}`
      : `${window.location.origin}/workspace/${encodeURIComponent(slug)}/files?file=${encodeURIComponent(file.id)}`;

  return api(`/workspaces/${encodeURIComponent(slug)}/messages`, {
    method: "POST",
    body: JSON.stringify({
      workspaceSlug: slug,
      conversationId,
      content: `Shared file: ${file.fileName}\n${link}`,
    }),
  });
}
