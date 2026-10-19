"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { updateTaskStatus } from "@/app/(dashboard)/kanban/actions";
import { cn } from "@/lib/utils";

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

interface Toast {
  id: number;
  message: string;
}

const columns: {
  label: string;
  status: Task["status"];
  accent: string;
  dot: string;
  dropZone: string;
}[] = [
  {
    label: "Pendiente",
    status: "pending",
    accent: "bg-slate-200 text-slate-700",
    dot: "bg-slate-400",
    dropZone: "border-slate-400 bg-slate-200/60",
  },
  {
    label: "En Proceso",
    status: "in_progress",
    accent: "bg-sky-100 text-sky-700",
    dot: "bg-sky-500",
    dropZone: "border-sky-400 bg-sky-50",
  },
  {
    label: "Completado",
    status: "completed",
    accent: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
    dropZone: "border-emerald-400 bg-emerald-50",
  },
];

const databaseStatus: Record<Task["status"], "PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
  pending: "PENDING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
};

const nextStatus: Record<Task["status"], Task["status"] | null> = {
  pending: "in_progress",
  in_progress: "completed",
  completed: null,
};

const priorityStyles: Record<Task["priority"], { label: string; className: string }> = {
  HIGH: { label: "Alta", className: "bg-rose-50 text-rose-700 ring-rose-200" },
  MEDIUM: { label: "Media", className: "bg-amber-50 text-amber-700 ring-amber-200" },
  LOW: { label: "Baja", className: "bg-slate-50 text-slate-600 ring-slate-200" },
};

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [pendingTaskIds, setPendingTaskIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [dragOverStatus, setDragOverStatus] = useState<Task["status"] | null>(null);
  const [recentlyMovedId, setRecentlyMovedId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);

  useEffect(() => {
    if (!recentlyMovedId) return;
    const timeout = window.setTimeout(() => setRecentlyMovedId(null), 900);
    return () => window.clearTimeout(timeout);
  }, [recentlyMovedId]);

  function showError(message: string) {
    toastId.current += 1;
    const id = toastId.current;
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
    }, 6000);
  }

  function setTaskPending(taskId: string, isPending: boolean) {
    setPendingTaskIds((current) => {
      const next = new Set(current);
      if (isPending) next.add(taskId);
      else next.delete(taskId);
      return next;
    });
  }

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    const previousIndex = tasks.findIndex((task) => task.id === taskId);
    const previousTask = tasks[previousIndex];
    if (!previousTask || previousTask.status === newStatus) return;
    if (pendingTaskIds.has(taskId)) return;

    const newPosition = tasks.filter((task) => task.status === newStatus).length;

    setTaskPending(taskId, true);
    setRecentlyMovedId(taskId);
    setTasks((currentTasks) => [
      ...currentTasks.filter((task) => task.id !== taskId),
      { ...previousTask, status: newStatus },
    ]);

    try {
      await updateTaskStatus({
        taskId,
        newStatus: databaseStatus[newStatus],
        newPosition,
      });
    } catch {
      setTasks((currentTasks) => {
        const withoutTask = currentTasks.filter((task) => task.id !== taskId);
        const restoreAt = Math.min(previousIndex, withoutTask.length);
        return [
          ...withoutTask.slice(0, restoreAt),
          previousTask,
          ...withoutTask.slice(restoreAt),
        ];
      });
      showError(
        `No se pudo mover "${previousTask.title}". Se restauró su estado original.`,
      );
    } finally {
      setTaskPending(taskId, false);
    }
  };

  function handleDragLeave(event: DragEvent<HTMLElement>, status: Task["status"]) {
    const related = event.relatedTarget;
    if (related instanceof Node && event.currentTarget.contains(related)) return;
    setDragOverStatus((current) => (current === status ? null : current));
  }

  const completedCount = tasks.filter((task) => task.status === "completed").length;
  const progress = tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0;
  const isSaving = pendingTaskIds.size > 0;

  return (
    <div className="space-y-6">
      <div className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {columns.map((column) => (
            <div key={column.status} className="flex items-center gap-2 text-sm">
              <span className={cn("h-2.5 w-2.5 rounded-full", column.dot)} />
              <span className="text-slate-500">{column.label}</span>
              <span className="font-semibold text-slate-900">
                {tasks.filter((task) => task.status === column.status).length}
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 sm:w-72">
          <div className="flex-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-slate-500">Progreso</span>
              <span className="font-semibold text-slate-900">{progress}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <span
            aria-live="polite"
            className={cn(
              "inline-flex min-w-[6.5rem] items-center gap-1.5 text-xs font-medium",
              isSaving ? "text-indigo-600" : "text-emerald-600",
            )}
          >
            {isSaving ? (
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
              >
                <path d="m5 12 5 5L20 7" />
              </svg>
            )}
            {isSaving ? "Sincronizando" : "Sincronizado"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
        {columns.map((column) => {
          const columnTasks = tasks.filter((task) => task.status === column.status);
          const isDropTarget =
            dragOverStatus === column.status &&
            draggingTaskId !== null &&
            tasks.find((task) => task.id === draggingTaskId)?.status !== column.status;

          return (
            <section
              key={column.status}
              aria-label={column.label}
              className={cn(
                "flex min-h-[18rem] flex-col rounded-2xl border-2 border-transparent bg-slate-100/80 p-3 transition-colors duration-200 sm:p-4",
                isDropTarget && column.dropZone,
                isDropTarget && "border-dashed",
              )}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = "move";
                if (dragOverStatus !== column.status) setDragOverStatus(column.status);
              }}
              onDragLeave={(event) => handleDragLeave(event, column.status)}
              onDrop={(event) => {
                event.preventDefault();
                setDragOverStatus(null);
                setDraggingTaskId(null);
                const taskId = event.dataTransfer.getData("text/plain");
                if (taskId) {
                  void handleStatusChange(taskId, column.status);
                }
              }}
            >
              <div className="mb-3 flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className={cn("h-2.5 w-2.5 rounded-full", column.dot)} />
                  <h2 className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    {column.label}
                  </h2>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-semibold",
                    column.accent,
                  )}
                >
                  {columnTasks.length}
                </span>
              </div>

              <div className="flex flex-1 flex-col gap-3">
                {columnTasks.map((task) => {
                  const isPending = pendingTaskIds.has(task.id);
                  const target = nextStatus[task.status];
                  const priority = priorityStyles[task.priority];

                  return (
                    <article
                      key={task.id}
                      data-testid={`task-card-${task.id}`}
                      draggable={!isPending}
                      aria-busy={isPending}
                      onDragStart={(event) => {
                        event.dataTransfer.setData("text/plain", task.id);
                        event.dataTransfer.effectAllowed = "move";
                        setDraggingTaskId(task.id);
                      }}
                      onDragEnd={() => {
                        setDraggingTaskId(null);
                        setDragOverStatus(null);
                      }}
                      className={cn(
                        "group relative rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200",
                        isPending ? "cursor-progress" : "cursor-grab hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md active:cursor-grabbing",
                        draggingTaskId === task.id && "rotate-1 scale-[0.98] opacity-40",
                        recentlyMovedId === task.id && "animate-scale-in ring-2 ring-indigo-400/60",
                      )}
                    >
                      {isPending && (
                        <span className="absolute inset-x-0 top-0 h-0.5 overflow-hidden rounded-t-xl bg-indigo-100">
                          <span className="animate-progress block h-full w-1/3 bg-indigo-500" />
                        </span>
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <span
                          className={cn(
                            "rounded-md px-2 py-0.5 text-[11px] font-semibold ring-1",
                            priority.className,
                          )}
                        >
                          {priority.label}
                        </span>
                        <svg
                          aria-hidden="true"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-slate-400"
                        >
                          <circle cx="9" cy="6" r="1.5" />
                          <circle cx="15" cy="6" r="1.5" />
                          <circle cx="9" cy="12" r="1.5" />
                          <circle cx="15" cy="12" r="1.5" />
                          <circle cx="9" cy="18" r="1.5" />
                          <circle cx="15" cy="18" r="1.5" />
                        </svg>
                      </div>
                      <p className="mt-2 break-words text-sm font-medium leading-snug text-slate-900">
                        {task.title}
                      </p>
                      {target && (
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => void handleStatusChange(task.id, target)}
                          className="mt-3 text-xs font-semibold text-indigo-600 transition hover:text-indigo-800 hover:underline disabled:opacity-50"
                        >
                          {isPending ? "Guardando..." : "Avanzar Estado →"}
                        </button>
                      )}
                    </article>
                  );
                })}

                {columnTasks.length === 0 && (
                  <div
                    className={cn(
                      "flex flex-1 items-center justify-center rounded-xl border-2 border-dashed border-slate-300/80 p-6 text-center text-sm text-slate-400 transition",
                      isDropTarget && "border-transparent",
                    )}
                  >
                    Suelta una tarjeta aquí
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="alert"
            className="animate-slide-up pointer-events-auto flex items-start gap-3 rounded-xl border border-rose-200 bg-white p-4 text-sm shadow-lg"
          >
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="h-3 w-3"
              >
                <path d="M12 8v4M12 16h.01" />
              </svg>
            </span>
            <p className="flex-1 text-slate-700">{toast.message}</p>
            <button
              type="button"
              aria-label="Cerrar notificación"
              onClick={() =>
                setToasts((current) => current.filter((item) => item.id !== toast.id))
              }
              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="h-4 w-4"
              >
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
