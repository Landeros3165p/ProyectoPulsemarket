import { expect, test } from "@playwright/test";

test("crea un producto y lo muestra en el catálogo", async ({ page }) => {
  const sku = `E2E-${Date.now()}`;
  const productName = `Producto de prueba ${sku}`;

  await page.goto("/products");
  await page.getByLabel("Nombre del producto").fill(productName);
  await page.getByLabel("Categoría del producto").selectOption("Electrónica");
  await page.getByLabel("Precio del producto").fill("129.99");
  await page.getByLabel("Stock del producto").fill("12");
  await page.getByLabel("SKU del producto").fill(sku);
  await page.getByRole("button", { name: "Crear producto" }).click();

  await expect(page.getByRole("status")).toHaveText(
    "Producto creado correctamente.",
  );
  await expect(
    page.getByRole("row").filter({ hasText: productName }),
  ).toContainText(sku);
});

test("abre el formulario de ajuste masivo de precios", async ({ page }) => {
  await page.goto("/products");
  await page.getByRole("button", { name: "Ajuste masivo de precios" }).click();

  await expect(
    page.getByRole("dialog", { name: "Ajuste Masivo de Precios" }),
  ).toBeVisible();
  await expect(page.getByLabel("Ajuste porcentual (%)")).toHaveValue("10");
});
