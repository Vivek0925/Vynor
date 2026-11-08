"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createWorkspace, type Workspace } from "@/lib/workspace";

interface CreateWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (workspace: Workspace) => void;
}

export default function CreateWorkspaceModal({
  open,
  onOpenChange,
  onCreated,
}: CreateWorkspaceModalProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const workspace = await createWorkspace({
        name: trimmedName,
        description: description.trim() || undefined,
      });

      onCreated?.(workspace);
      onOpenChange(false);
      router.push(`/workspace/${workspace.slug}`);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to create workspace.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[440px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[26px] bg-cream p-7 text-ink shadow-[0_30px_80px_rgba(23,32,26,0.2)] outline-none">
          <div className="flex items-start justify-between gap-4">
            <div>
              <Dialog.Title className="text-[30px] font-light tracking-[-0.04em]">
                New workspace
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm leading-relaxed text-muted">
                Create a focused space for your next project.
              </Dialog.Description>
            </div>

            <Dialog.Close className="rounded-full border border-[#DEDFE8] px-3 py-1 text-[12px] text-[#5B5D6E] transition-colors hover:bg-[#FAFAF8]">
              Close
            </Dialog.Close>
          </div>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-name"
                className="text-[13px] font-medium text-[#14141C]"
              >
                Workspace name
              </label>
              <input
                id="workspace-name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Marketing sprint"
                className="h-11 rounded-xl border border-ink/25 bg-white px-4 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-ink"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="workspace-description"
                className="text-[13px] font-medium text-[#14141C]"
              >
                Description
              </label>
              <textarea
                id="workspace-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="A shared space for launch planning and project updates"
                className="min-h-[96px] rounded-xl border border-ink/25 bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 outline-none transition-colors focus:border-ink"
              />
            </div>

            {error && (
              <div className="rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
                {error}
              </div>
            )}

            <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="rounded-full border border-ink/30 px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-white"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={loading}
                className="rounded-full bg-coral px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating..." : "Create workspace"}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
