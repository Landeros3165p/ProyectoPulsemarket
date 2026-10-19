"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/(dashboard)/kanban/actions";
import { showToast } from "@/lib/alerts";

export interface Task {
  id: string;
  title: string;
  status: "pending" | "in_progress" | "completed";
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

export function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

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
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
        {columns.map((column) => (
          <section
            key={column.status}
            aria-label={column.label}
            className="rounded-xl border border-slate-200 bg-slate-100 p-4"
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              const taskId = event.dataTransfer.getData("text/plain");
              if (taskId) {
                void handleStatusChange(taskId, column.status);
              }
            }}
          >
            <h2 className="mb-4 text-base font-bold text-slate-700">
              {column.label}
            </h2>
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
                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <p className="break-words text-sm font-medium text-slate-900">
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
                        className="mt-3 text-xs font-semibold text-blue-600 hover:underline disabled:opacity-50"
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
    </>
  );
}
