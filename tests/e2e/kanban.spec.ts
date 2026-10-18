import { expect, test } from "@playwright/test";
import { PrismaClient, TaskStatus } from "@prisma/client";

const testWithTask = test.extend<{ kanbanTaskId: string }>({
  kanbanTaskId: async ({}, use) => {
    const prisma = new PrismaClient();
    let taskId: string | undefined;

    try {
      const task = await prisma.task.create({
        data: {
          title: "Tarea E2E Kanban",
          status: TaskStatus.PENDING,
        },
      });
      taskId = task.id;
      await use(task.id);
    } finally {
      try {
        if (taskId) {
          await prisma.task.delete({ where: { id: taskId } });
        }
      } finally {
        await prisma.$disconnect();
      }
    }
  },
});

testWithTask("arrastra una tarea y conserva su estado después de recargar", async ({
  page,
  kanbanTaskId,
}) => {
  await page.goto("/kanban");

  const task = page.getByTestId(`task-card-${kanbanTaskId}`);
  const inProgressColumn = page.getByRole("region", { name: "En Proceso" });
  const inProgressHeading = inProgressColumn.getByRole("heading", {
    name: "En Proceso",
  });
  await expect(task).toBeVisible();
  await task.dragTo(inProgressHeading);
  const movedTask = inProgressColumn.getByTestId(`task-card-${kanbanTaskId}`);
  await expect(movedTask).toBeVisible();
  await expect(movedTask.getByRole("button")).toHaveText(
    "Avanzar Estado →",
    { timeout: 15_000 },
  );

  await page.reload();

  await expect(
    page
      .getByRole("region", { name: "En Proceso" })
      .getByTestId(`task-card-${kanbanTaskId}`),
  ).toBeVisible();
});
