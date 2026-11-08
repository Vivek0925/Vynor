"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Delete,
  Edit3,
  Link as LinkIcon,
  Mail,
  MoreVertical,
  Settings,
  Star,
} from "lucide-react";
import {
  deleteWorkspace,
  updateWorkspace,
  type Workspace,
} from "@/lib/workspace";
import { ActionDialog, ConfirmDialog } from "@/components/ui/ActionDialog";
import { useToast } from "@/components/ui/Toast";

export interface WorkspaceCardData {
  id: string;
  slug: string;
  name: string;
  status: string;
  updatedAt: string;
  members: string;
  accent: string;
}

interface WorkspaceCardProps {
  workspace: WorkspaceCardData;
  isPinned?: boolean;
  onPin?: () => void;
  onUpdated?: (workspace: Workspace) => void;
  onDeleted?: (workspaceId: string) => void;
}

export default function WorkspaceCard({
  workspace,
  isPinned = false,
  onPin,
  onUpdated,
  onDeleted,
}: WorkspaceCardProps) {
  const router = useRouter();
  const cardRef = useRef<HTMLElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(workspace.name);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const { showToast } = useToast();

  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;

      if (cardRef.current && target && !cardRef.current.contains(target)) {
        closeMenu();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [menuOpen]);

  const handleOpen = () => {
    closeMenu();
    router.push(`/workspace/${workspace.slug}`);
  };

  const handleRename = async () => {
    closeMenu();
    setRenameValue(workspace.name);
    setRenameOpen(true);
  };

  const submitRename = async () => {
    const nextName = renameValue.trim();

    if (!nextName || nextName === workspace.name) {
      setRenameOpen(false);
      return;
    }

    try {
      setBusy(true);
      const updated = await updateWorkspace(workspace.id, { name: nextName });
      onUpdated?.(updated);
      setRenameOpen(false);
      showToast({ message: "Workspace renamed.", tone: "success" });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Unable to rename workspace.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleInvite = () => {
    closeMenu();
    if (!navigator.clipboard) {
      showToast({ message: "Unable to copy invite link.", tone: "error" });
      return;
    }
    void navigator.clipboard
      .writeText(`${window.location.origin}/workspace/${workspace.slug}`)
      .then(() =>
        showToast({ message: "Invite link copied.", tone: "success" }),
      )
      .catch(() =>
        showToast({ message: "Unable to copy invite link.", tone: "error" }),
      );
  };

  const handleSettings = () => {
    closeMenu();
  };

  const handleDelete = async () => {
    closeMenu();
    setDeleteOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setBusy(true);
      await deleteWorkspace(workspace.id);
      onDeleted?.(workspace.id);
      setDeleteOpen(false);
      showToast({ message: "Workspace deleted.", tone: "success" });
    } catch (error) {
      showToast({
        message:
          error instanceof Error ? error.message : "Unable to delete workspace.",
        tone: "error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <article
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleOpen}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleOpen();
        }
      }}
      className="group relative rounded-[26px] border border-ink/15 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-ink/30 sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className={`h-2.5 w-2.5 rounded-full ${workspace.accent}`} />
          <h3 className="mt-4 break-words text-lg font-semibold tracking-[-0.03em] text-ink">
            {workspace.name}
          </h3>
          <p className="mt-1 text-sm text-muted">{workspace.members}</p>
        </div>
        <div className="relative flex items-start gap-2">
          <span className="max-w-[110px] truncate rounded-full border border-[#DEDFE8] px-2.5 py-1 text-[11px] text-[#5B5D6E] sm:max-w-none sm:px-3 sm:text-[12px]">
            {workspace.status}
          </span>

          <button
            type="button"
            aria-label={`Pin ${workspace.name}`}
            aria-pressed={isPinned}
            onClick={(event) => {
              event.stopPropagation();
              onPin?.();
            }}
            className={`flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 transition hover:bg-cream hover:text-coral ${isPinned ? "text-coral [&_svg]:fill-coral" : "text-muted"}`}
          >
            <Star className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={busy}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-label={`Workspace actions for ${workspace.name}`}
            onClick={(event) => {
              event.stopPropagation();
              setMenuOpen((current) => !current);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-ink/15 text-muted transition-colors hover:bg-cream hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
          >
            <MoreVertical className="h-4 w-4" />
          </button>

          {menuOpen ? (
            <div
              role="menu"
              aria-label="Workspace actions"
              onClick={(event) => event.stopPropagation()}
              className="absolute right-0 top-11 z-20 min-w-[220px] rounded-[20px] border border-[#DEDFE8] bg-white p-2 shadow-[0_24px_64px_rgba(20,20,28,0.16)]"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleOpen}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <LinkIcon className="h-4 w-4 text-[#5B5D6E]" />
                Open
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleRename}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Edit3 className="h-4 w-4 text-[#5B5D6E]" />
                Rename
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleInvite}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Mail className="h-4 w-4 text-[#5B5D6E]" />
                Copy invite link
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleSettings}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#14141C] transition-colors hover:bg-[#FAFAF8]"
              >
                <Settings className="h-4 w-4 text-[#5B5D6E]" />
                Settings
              </button>
              <div className="my-2 h-px bg-[#DEDFE8]" />
              <button
                type="button"
                role="menuitem"
                onClick={handleDelete}
                className="flex w-full items-center gap-2 rounded-[14px] px-3 py-2 text-left text-[13px] text-[#B91C1C] transition-colors hover:bg-[#FEF2F2]"
              >
                <Delete className="h-4 w-4" />
                Delete
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-ink/10 pt-4 text-xs text-muted">
        Updated {workspace.updatedAt}
        <span className="font-medium text-ink opacity-0 transition group-hover:opacity-100">Open →</span>
      </div>
      <ActionDialog
        open={renameOpen}
        title="Rename workspace"
        onClose={() => !busy && setRenameOpen(false)}
        submitLabel="Save"
        loading={busy}
        onSubmit={(event) => {
          event.preventDefault();
          void submitRename();
        }}
      >
        <label className="block text-sm font-medium text-ink">
          Workspace name
          <input
            autoFocus
            value={renameValue}
            onChange={(event) => setRenameValue(event.target.value)}
            className="mt-2 h-11 w-full rounded-xl border border-border bg-surface px-3 text-sm text-ink outline-none transition focus:border-primary"
          />
        </label>
      </ActionDialog>
      <ConfirmDialog
        open={deleteOpen}
        title={`Delete ${workspace.name}?`}
        description="This workspace and its data cannot be recovered."
        onClose={() => !busy && setDeleteOpen(false)}
        onConfirm={() => void confirmDelete()}
        loading={busy}
        destructive
      />
    </article>
  );
}
