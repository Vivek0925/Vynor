"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Plus,
  Pencil,
  ArrowLeft,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { Task, TaskList } from "./task-types";
import TaskCard from "./TaskCard";

type TaskListColumnProps = {
  list: TaskList;
  onAddTask: (listId: string) => void;
  onTaskClick: (task: Task) => void;
  onToggleComplete?: (task: Task) => void;
  movingTaskId: string | null;
  onRenameList: (list: TaskList) => void;
  editingListId: string | null;
  editingListName: string;
  onEditingListNameChange: (name: string) => void;
  onSaveRenameList: (listId: string) => void;
  onCancelRenameList: () => void;
  savingList: boolean;
  onMoveListLeft: (list: TaskList) => void;
  onMoveListRight: (list: TaskList) => void;
  onDeleteList: (list: TaskList) => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
};

export default function TaskListColumn({
  list,
  onAddTask,
  onTaskClick,
  onToggleComplete,
  movingTaskId,
  onRenameList,
  editingListId,
  editingListName,
  onEditingListNameChange,
  onSaveRenameList,
  onCancelRenameList,
  savingList,
  onMoveListLeft,
  onMoveListRight,
  onDeleteList,
  canMoveLeft,
  canMoveRight,
}: TaskListColumnProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const { setNodeRef, isOver } = useDroppable({
    id: list.id,
  });

  const tasks = [...list.tasks].sort((a, b) => a.position - b.position);

  function runAction(action: () => void) {
    setMenuOpen(false);
    action();
  }

  return (
    <section
      ref={setNodeRef}
      className={[
  "relative flex h-fit max-h-full w-[310px] shrink-0 flex-col",
  "rounded-2xl border border-[#E5E7EB] bg-white shadow-sm transition",
  isOver ? "ring-2 ring-[#16A36A]/30 border-[#16A36A]" : "",
].join(" ")}
    >
      <header className="relative flex h-12 shrink-0 items-center justify-between px-3">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {editingListId === list.id ? (
            <form
              className="flex min-w-0 flex-1 items-center gap-1"
              onSubmit={(event) => {
                event.preventDefault();
                onSaveRenameList(list.id);
              }}
            >
              <input
                autoFocus
                value={editingListName}
                onChange={(event) =>
                  onEditingListNameChange(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Escape") onCancelRenameList();
                }}
                disabled={savingList}
                maxLength={80}
                className="min-w-0 w-full rounded-md border border-[#D1D5DB] bg-white px-2 py-1 text-[13px] text-[#292934] outline-none focus:border-[#16A36A] focus:ring-2 focus:ring-[#16A36A]/10"
                aria-label="Task list name"
              />
              <button
                type="submit"
                disabled={savingList || !editingListName.trim()}
                className="rounded-md px-2 py-1 text-xs font-medium text-[#128653] hover:bg-[#E8F6EE] disabled:opacity-40"
              >
                {savingList ? "..." : "Save"}
              </button>
              <button
                type="button"
                onClick={onCancelRenameList}
                disabled={savingList}
                className="rounded-md px-2 py-1 text-xs text-[#737380] hover:bg-[#F3F4F6]"
              >
                Cancel
              </button>
            </form>
          ) : (
            <h2 className="truncate text-[13px] font-semibold text-[#292934]">
              {list.name}
            </h2>
          )}

          <span className="shrink-0 rounded-md bg-[#F3F4F6] px-1.5 py-0.5 text-[11px] font-medium text-[#737380]">
            {tasks.length}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-md p-1.5 text-[#858591] transition hover:bg-[#F3F4F6] hover:text-[#292934]"
          aria-label={`List options for ${list.name}`}
          aria-expanded={menuOpen}
          aria-haspopup="menu"
        >
          <MoreHorizontal size={16} />
        </button>

        {menuOpen && (
          <div
            role="menu"
            className="absolute right-2 top-10 z-50 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-700 shadow-xl"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(() => onRenameList(list))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
            >
              <Pencil size={15} />
              Rename list
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={!canMoveLeft}
              onClick={() => runAction(() => onMoveListLeft(list))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft size={15} />
              Move left
            </button>

            <button
              type="button"
              role="menuitem"
              disabled={!canMoveRight}
              onClick={() => runAction(() => onMoveListRight(list))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight size={15} />
              Move right
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              role="menuitem"
              onClick={() => runAction(() => onDeleteList(list))}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} />
              Delete list
            </button>
          </div>
        )}
      </header>

      <SortableContext
        items={tasks.map((task) => task.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="min-h-[20px] space-y-2 overflow-visible px-2 pb-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={
                movingTaskId === task.id
                  ? "opacity-50 transition-opacity"
                  : "transition-opacity"
              }
            >
              <TaskCard
                task={task}
                onClick={onTaskClick}
                onToggleComplete={onToggleComplete}
                isCompleted={list.name.trim().toUpperCase() === "DONE"}
              />
            </div>
          ))}

          {tasks.length === 0 && (
            <div className="rounded-xl border border-dashed border-[#D1D5DB] bg-[#F9FAFB] px-3 py-7 text-center text-[11px] text-[#9CA3AF]">
  Drop a card here
</div>
          )}
        </div>
      </SortableContext>

      <button
        type="button"
        onClick={() => onAddTask(list.id)}
        className="mx-2 mb-2 flex h-9 shrink-0 items-center gap-2 rounded-xl px-2 text-left text-[12px] font-medium text-[#737380] transition hover:bg-[#E8F6EE] hover:text-[#128653]"
      >
        <Plus size={15} />
        Add a card
      </button>
    </section>
  );
}
