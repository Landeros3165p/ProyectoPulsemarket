"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/(dashboard)/kanban/actions";
import { showToast } from "@/lib/alerts";

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
  priority: string;
}

interface KanbanBoardProps {
  initialTasks: Task[];
}

const columns: { label: string; status: Task["status"] }[] = [
  { label: "Pendiente", status: "pending" },
  { label: "En Proceso", status: "in_progress" },
  { label: "Completado", status: "completed" },
];

const databaseStatus: Record<Task["status"], "PENDING" | "IN_PROGRESS" | "COMPLETED"> = {
  pending: "PENDING",
  in_progress: "IN_PROGRESS",
  completed: "COMPLETED",
};

const priorityStyles: Record<string, string> = {
  LOW: "border-slate-200 bg-slate-50 text-slate-600",
  MEDIUM: "border-amber-200 bg-amber-50 text-amber-700",
  HIGH: "border-rose-200 bg-rose-50 text-rose-700",
};

const statusStyles: Record<Task["status"], { dot: string; count: string }> = {
  pending: { dot: "bg-slate-400", count: "bg-slate-200 text-slate-600" },
  in_progress: { dot: "bg-sky-500", count: "bg-sky-100 text-sky-700" },
  completed: { dot: "bg-emerald-500", count: "bg-emerald-100 text-emerald-700" },
};

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);
  const completedCount = tasks.filter(
    (task) => task.status === "completed",
  ).length;
  const progress = tasks.length
    ? Math.round((completedCount / tasks.length) * 100)
    : 0;

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    const previousTask = tasks.find((task) => task.id === taskId);
    if (!previousTask) return;

    const newPosition = tasks.filter((task) => task.status === newStatus).length;
    setPendingTaskId(taskId);
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task,
      ),
    );

    try {
      await updateTaskStatus({
        taskId,
        newStatus: databaseStatus[newStatus],
        newPosition,
      });
    } catch {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === taskId ? previousTask : task,
        ),
      );
      showToast("error", "No se pudo guardar el cambio. Inténtalo de nuevo.");
    } finally {
      setPendingTaskId(null);
    }
  };

  return (
    <div className="space-y-4">
      <section
        aria-label="Resumen de tareas"
        className="flex flex-col gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5"
      >
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {columns.map((column) => {
            const count = tasks.filter(
              (task) => task.status === column.status,
            ).length;
            return (
              <span
                key={column.status}
                className="inline-flex items-center gap-2 text-xs text-slate-500"
              >
                <span
                  className={`h-2 w-2 rounded-full ${statusStyles[column.status].dot}`}
                />
                {column.label}
                <strong className="font-bold text-slate-800">{count}</strong>
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-3 sm:w-56">
          <span className="text-xs text-slate-500">Progreso</span>
          <div
            className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="Progreso de tareas completadas"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-700">{progress}%</span>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-5">
        {columns.map((column) => (
          <section
            key={column.status}
            aria-label={column.label}
            className="min-h-64 rounded-2xl border border-slate-200/70 bg-slate-100/80 p-3.5 sm:p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData("text/plain");
              if (taskId) {
                void handleStatusChange(taskId, column.status);
              }
            }}
          >
            <header className="mb-3 flex items-center justify-between px-1">
              <h2 className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wide text-slate-600">
                <span
                  className={`h-2 w-2 rounded-full ${statusStyles[column.status].dot}`}
                />
                {column.label}
              </h2>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyles[column.status].count}`}
              >
                {tasks.filter((task) => task.status === column.status).length}
              </span>
            </header>
            <div className="space-y-3">
              {tasks
                .filter((task) => task.status === column.status)
                .map((task) => (
                  <article
                    key={task.id}
                    data-testid={`task-card-${task.id}`}
                    draggable={pendingTaskId !== task.id}
                    onDragStart={(event) => {
                      event.dataTransfer.setData("text/plain", task.id);
                      event.dataTransfer.effectAllowed = "move";
                    }}
                    className={`group rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                      pendingTaskId === task.id ? "opacity-60" : ""
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span
                        className={`rounded-md border px-1.5 py-0.5 text-[9px] font-bold ${
                          priorityStyles[task.priority.toUpperCase()] ??
                          priorityStyles.MEDIUM
                        }`}
                      >
                        {task.priority === "HIGH"
                          ? "Alta"
                          : task.priority === "LOW"
                            ? "Baja"
                            : "Media"}
                      </span>
                      <span
                        aria-hidden="true"
                        className="text-slate-300 transition group-hover:text-slate-500"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          fill="currentColor"
                          className="h-3 w-3"
                        >
                          <circle cx="3" cy="2" r="1" />
                          <circle cx="9" cy="2" r="1" />
                          <circle cx="3" cy="6" r="1" />
                          <circle cx="9" cy="6" r="1" />
                          <circle cx="3" cy="10" r="1" />
                          <circle cx="9" cy="10" r="1" />
                        </svg>
                      </span>
                    </div>
                    <p className="break-words text-[13px] font-medium leading-5 text-slate-800">
                      {task.title}
                    </p>
                    {column.status !== "completed" && (
                      <button
                        type="button"
                        disabled={pendingTaskId === task.id}
                        onClick={() =>
                          handleStatusChange(
                            task.id,
                            column.status === "pending"
                              ? "in_progress"
                              : "completed",
                          )
                        }
                        className="mt-3 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline disabled:opacity-50"
                      >
                        {pendingTaskId === task.id
                          ? "Guardando..."
                          : "Avanzar Estado →"}
                      </button>
                    )}
                  </article>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
