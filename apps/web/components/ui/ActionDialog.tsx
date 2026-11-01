"use client";

import { FormEvent, useEffect, useState } from "react";
import { Loader2, X } from "lucide-react";

type ActionDialogProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
  onSubmit?: (event: FormEvent<HTMLFormElement>) => void;
  submitLabel?: string;
  submitClassName?: string;
  loading?: boolean;
};

export function ActionDialog({
  open,
  title,
  description,
  onClose,
  children,
  onSubmit,
  submitLabel,
  submitClassName = "bg-ink text-text-warm hover:bg-forest",
  loading = false,
}: ActionDialogProps) {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [loading, onClose, open]);

  if (!open) return null;

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-muted">{description}</p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close dialog"
          className="rounded-lg p-2 text-muted transition hover:bg-surface-secondary hover:text-ink disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-5">{children}</div>
      {submitLabel && (
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-ink transition hover:bg-surface-secondary disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type={onSubmit ? "submit" : "button"}
            onClick={!onSubmit ? onClose : undefined}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${submitClassName}`}
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {submitLabel}
          </button>
        </div>
      )}
    </>
  );

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={() => !loading && onClose()}
        className="absolute inset-0 bg-ink/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="action-dialog-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-surface p-5 shadow-lg sm:p-6"
      >
        {onSubmit ? (
          <form onSubmit={onSubmit}>
            <span id="action-dialog-title" className="sr-only">
              {title}
            </span>
            {content}
          </form>
        ) : (
          <>
            <span id="action-dialog-title" className="sr-only">
              {title}
            </span>
            {content}
          </>
        )}
      </div>
    </div>
  );
}

type ConfirmDialogProps = Omit<ActionDialogProps, "children" | "onSubmit"> & {
  onConfirm: () => void;
  confirmLabel?: string;
  destructive?: boolean;
};

export function ConfirmDialog({
  onConfirm,
  confirmLabel = "Delete",
  destructive = false,
  ...props
}: ConfirmDialogProps) {
  return (
    <ActionDialog
      {...props}
      submitLabel={confirmLabel}
      submitClassName={
        destructive
          ? "bg-red-600 text-white hover:bg-red-700"
          : props.submitClassName
      }
      onSubmit={(event) => {
        event.preventDefault();
        onConfirm();
      }}
    >
      {null}
    </ActionDialog>
  );
}
