"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { updateTaskStatusSchema } from "@/lib/validators/schemas";

export async function updateTaskStatus(rawInput: unknown) {
  await requireSession();
  const input = updateTaskStatusSchema.parse(rawInput);

  await db.task.update({
    where: { id: input.taskId },
    data: {
      status: input.newStatus,
      position: input.newPosition,
    },
  });

  revalidatePath("/kanban");
  return { success: true };
}

export async function getKanbanTasks() {
  await requireSession();

  return db.task.findMany({
    orderBy: [{ status: "asc" }, { position: "asc" }],
  });
}
