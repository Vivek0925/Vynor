"use client";

import { useEffect, useRef, useState } from "react";
import {
  Download,
  File as FileIcon,
  Loader2,
  Share2,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";

import WorkspaceSectionPage from "../_components/WorkspaceSectionPage";
import { ConfirmDialog } from "@/components/ui/ActionDialog";
import { getConversations, type Conversation } from "@/lib/conversations";
import {
  deleteWorkspaceFile,
  getWorkspaceFileDownloadUrl,
  getWorkspaceFiles,
  sendFileToConversation,
  toggleWorkspaceFileStar,
  uploadWorkspaceFile,
  type WorkspaceFile,
} from "@/lib/files";
import { useToast } from "@/components/ui/Toast";

function formatSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

export default function FilesPage({ params }: { params: Promise<{ slug: string }> }) {
  const [slug, setSlug] = useState("");
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sharing, setSharing] = useState<WorkspaceFile | null>(null);
  const [fileToDelete, setFileToDelete] = useState<WorkspaceFile | null>(null);
  const [selectedConversation, setSelectedConversation] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  useEffect(() => {
    void params.then(({ slug: value }) => setSlug(value));
  }, [params]);

  useEffect(() => {
    if (!slug) return;
    let active = true;
    Promise.all([getWorkspaceFiles(slug), getConversations(slug)])
      .then(([loadedFiles, loadedConversations]) => {
        if (!active) return;
        setFiles(loadedFiles);
        setConversations(loadedConversations);
      })
      .catch((error) =>
        showToast({
          message: error instanceof Error ? error.message : "Unable to load files.",
          tone: "error",
        }),
      )
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [slug, showToast]);

  async function handleUpload(file: File | undefined) {
    if (!file || !slug) return;
    setUploading(true);
    try {
      const created = await uploadWorkspaceFile(slug, file);
      setFiles((current) => [created, ...current]);
      showToast({ message: "File uploaded.", tone: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Upload failed.",
        tone: "error",
      });
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDownload(file: WorkspaceFile) {
    try {
      const { url } = await getWorkspaceFileDownloadUrl(slug, file.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Download failed.",
        tone: "error",
      });
    }
  }

  async function handleStar(file: WorkspaceFile) {
    try {
      const updated = await toggleWorkspaceFileStar(slug, file.id);
      setFiles((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to update star.",
        tone: "error",
      });
    }
  }

  async function handleDelete(file: WorkspaceFile) {
    try {
      await deleteWorkspaceFile(slug, file.id);
      setFiles((current) => current.filter((item) => item.id !== file.id));
      setFileToDelete(null);
      showToast({ message: "File deleted.", tone: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to delete file.",
        tone: "error",
      });
    }
  }

  async function handleShare() {
    if (!sharing || !selectedConversation) return;
    try {
      await sendFileToConversation(slug, selectedConversation, sharing);
      setSharing(null);
      setSelectedConversation("");
      showToast({ message: "File shared in chat.", tone: "success" });
    } catch (error) {
      showToast({
        message: error instanceof Error ? error.message : "Unable to share file.",
        tone: "error",
      });
    }
  }

  return (
    <WorkspaceSectionPage
      eyebrow="Files"
      title="Files"
      headerActions={
        <>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={(event) => void handleUpload(event.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--workspace-ink)] px-4 py-2 text-sm font-medium text-[var(--workspace-surface)] disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Upload
          </button>
        </>
      }
    >
      <div className="py-4">
        {loading ? (
          <div className="flex items-center gap-2 p-6 text-sm text-[var(--workspace-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading files...
          </div>
        ) : files.length === 0 ? (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center rounded-2xl border border-dashed border-[var(--workspace-line)] bg-[var(--workspace-surface-secondary)] p-12 text-center text-sm text-[var(--workspace-muted)]"
          >
            <Upload className="mb-3 h-7 w-7" />
            Upload your first file
          </button>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-[var(--workspace-line)]">
            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-3 border-b border-[var(--workspace-line)] px-4 py-3 last:border-b-0">
                <FileIcon className="h-5 w-5 shrink-0 text-[var(--workspace-coral)]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-[var(--workspace-ink)]">{file.fileName}</div>
                  <div className="text-xs text-[var(--workspace-muted)]">
                    {formatSize(file.size)} · {formatDate(file.createdAt)} · {file.uploadedBy.name}
                  </div>
                </div>
                <button type="button" onClick={() => void handleStar(file)} aria-label={file.starred ? "Unstar file" : "Star file"} className="rounded-lg p-2 text-[var(--workspace-muted)] hover:text-[var(--workspace-coral)]">
                  <Star className={`h-4 w-4 ${file.starred ? "fill-current text-[var(--workspace-coral)]" : ""}`} />
                </button>
                <button type="button" onClick={() => setSharing(file)} aria-label={`Share ${file.fileName}`} className="rounded-lg p-2 text-[var(--workspace-muted)] hover:text-[var(--workspace-ink)]">
                  <Share2 className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => void handleDownload(file)} aria-label={`Download ${file.fileName}`} className="rounded-lg p-2 text-[var(--workspace-muted)] hover:text-[var(--workspace-ink)]">
                  <Download className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setFileToDelete(file)} aria-label={`Delete ${file.fileName}`} className="rounded-lg p-2 text-[var(--workspace-muted)] hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {sharing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 p-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[var(--workspace-ink)]">Share file</h2>
              <button type="button" onClick={() => setSharing(null)} aria-label="Close share dialog"><X className="h-5 w-5" /></button>
            </div>
            <p className="mb-4 truncate text-sm text-[var(--workspace-muted)]">{sharing.fileName}</p>
            <select
              value={selectedConversation}
              onChange={(event) => setSelectedConversation(event.target.value)}
              className="mb-4 h-10 w-full rounded-xl border border-[var(--workspace-line)] bg-[var(--workspace-surface)] px-3 text-sm text-[var(--workspace-ink)]"
            >
              <option value="">Choose a channel or DM</option>
              {conversations.map((conversation) => (
                <option key={conversation.id} value={conversation.id}>
                  {conversation.type === "CHANNEL"
                    ? `# ${conversation.name ?? "channel"}`
                    : `DM · ${conversation.participants.map((participant) => participant.user.name).join(", ")}`}
                </option>
              ))}
            </select>
            <button type="button" disabled={!selectedConversation} onClick={() => void handleShare()} className="w-full rounded-full bg-[var(--workspace-coral)] px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Share in chat</button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(fileToDelete)}
        title="Delete file?"
        description={
          fileToDelete
            ? `"${fileToDelete.fileName}" will be permanently deleted.`
            : undefined
        }
        onClose={() => setFileToDelete(null)}
        onConfirm={() => {
          if (fileToDelete) void handleDelete(fileToDelete);
        }}
        confirmLabel="Delete file"
        destructive
      />
    </WorkspaceSectionPage>
  );
}
