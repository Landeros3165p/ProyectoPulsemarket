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
  }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 sm:text-3xl">
        Gestor Kanban
      </h1>
      <KanbanBoard initialTasks={tasks} />
    </div>
  );
}
