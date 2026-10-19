import { TaskStatus } from "@prisma/client";
import { KanbanBoard, type Task } from "@/components/kanban/kanban-board";
import { getKanbanTasks } from "./actions";

export const dynamic = "force-dynamic";

const taskStatus: Record<TaskStatus, Task["status"]> = {
  [TaskStatus.PENDING]: "pending",
  [TaskStatus.IN_PROGRESS]: "in_progress",
  [TaskStatus.COMPLETED]: "completed",
};

export default async function KanbanPage() {
  const databaseTasks = await getKanbanTasks();
  const tasks: Task[] = databaseTasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: taskStatus[task.status],
    priority: task.priority,
  }));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-500">
          Organización del equipo
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Gestor Kanban
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Arrastra las tarjetas entre columnas para actualizar su estado. Los
          cambios se guardan automáticamente.
        </p>
      </div>
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}
