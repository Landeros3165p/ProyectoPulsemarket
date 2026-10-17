import { expect, test } from "@playwright/test";

test("arrastra una tarea y conserva su estado después de recargar", async ({
  page,
}) => {
  await page.goto("/kanban");

  const task = page.getByTestId("task-card-seed_task_1");
  const inProgressColumn = page.getByRole("region", { name: "En Proceso" });
  await expect(task).toBeVisible();
  await task.dragTo(inProgressColumn);
  const movedTask = inProgressColumn.getByTestId("task-card-seed_task_1");
  await expect(movedTask.getByRole("button", { name: "Avanzar Estado →" }))
    .toBeEnabled();

  await page.reload();

  await expect(
    page
      .getByRole("region", { name: "En Proceso" })
      .getByTestId("task-card-seed_task_1"),
  ).toBeVisible();
});
