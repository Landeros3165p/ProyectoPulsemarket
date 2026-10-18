import { expect, test } from "@playwright/test";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("autenticación", () => {
  test("muestra los proveedores OAuth en la pantalla de login", async ({
    page,
  }) => {
    await page.goto("/login");

    await expect(
      page.getByRole("heading", { name: "PulseMarket" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continuar con Google" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Continuar con GitHub" }),
    ).toBeVisible();
  });

  test("redirige del panel al login cuando no hay sesión", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/login\?callbackUrl=/);
  });

  test("expone los proveedores configurados por NextAuth", async ({ request }) => {
    const response = await request.get("/api/auth/providers");

    expect(response.ok()).toBe(true);
    await expect(response.json()).resolves.toMatchObject({
      google: { id: "google", type: "oauth" },
      github: { id: "github", type: "oauth" },
    });
  });
});
