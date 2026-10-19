import { Suspense } from "react";
import { TaskStatus } from "@prisma/client";
import { KanbanBoard, type Task } from "@/components/kanban/kanban-board";
import { Skeleton } from "@/components/ui/skeleton";
import { getKanbanTasks } from "./actions";

export const dynamic = "force-dynamic";

const taskStatus: Record<TaskStatus, Task["status"]> = {
  [TaskStatus.PENDING]: "pending",
  [TaskStatus.IN_PROGRESS]: "in_progress",
  [TaskStatus.COMPLETED]: "completed",
};

const taskPriorities: readonly Task["priority"][] = ["LOW", "MEDIUM", "HIGH"];

function toPriority(value: string): Task["priority"] {
  return taskPriorities.find((priority) => priority === value) ?? "MEDIUM";
}

async function KanbanData() {
  const databaseTasks = await getKanbanTasks();
  const tasks: Task[] = databaseTasks.map((task) => ({
    id: task.id,
    title: task.title,
    status: taskStatus[task.status],
    priority: toPriority(task.priority),
  }));

  return <KanbanBoard initialTasks={tasks} />;
}

function KanbanSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-20 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 sm:gap-6">
        {Array.from({ length: 3 }, (_, column) => (
          <div key={column} className="rounded-2xl border border-slate-200 bg-slate-100/70 p-4">
            <Skeleton className="mb-4 h-6 w-32" />
            <div className="space-y-3">
              {Array.from({ length: 3 }, (_, card) => (
                <Skeleton key={card} className="h-24 w-full rounded-xl bg-white" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function KanbanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Gestor Kanban
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Arrastra las tarjetas entre columnas para actualizar su estado. Los
          cambios se guardan automáticamente.
        </p>
      </div>
      <Suspense fallback={<KanbanSkeleton />}>
        <KanbanData />
      </Suspense>
    </div>
  );
}
