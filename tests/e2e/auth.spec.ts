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
      page.getByRole("link", { name: "Continuar con Google" }),
    ).toHaveAttribute("href", "/api/auth/signin/google");
    await expect(
      page.getByRole("link", { name: "Continuar con GitHub" }),
    ).toHaveAttribute("href", "/api/auth/signin/github");
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
