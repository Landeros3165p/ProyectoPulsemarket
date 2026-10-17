import { faker } from "@faker-js/faker";
import { PrismaClient, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();
const customerCount = 1_000;
const productCount = 2_000;

async function main() {
  faker.seed(20261017);
  console.info("Insertando datos de ejemplo sin borrar registros existentes...");

  await prisma.customer.createMany({
    data: Array.from({ length: customerCount }, (_, index) => {
      const id = index + 1;
      return {
        id: `seed_customer_${id}`,
        name: faker.person.fullName(),
        email: `seed.customer.${id}@example.test`,
      };
    }),
    skipDuplicates: true,
  });

  await prisma.product.createMany({
    data: Array.from({ length: productCount }, (_, index) => {
      const id = index + 1;
      return {
        id: `seed_product_${id}`,
        name: faker.commerce.productName(),
        category: faker.helpers.arrayElement([
          "Electrónica",
          "Muebles",
          "Ropa",
          "Hogar",
          "Deportes",
        ]),
        price: Number(faker.commerce.price({ min: 10, max: 1_500 })),
        stock: faker.number.int({ min: 0, max: 500 }),
        sku: `SEED-${id}`,
      };
    }),
    skipDuplicates: true,
  });

  const customers = await prisma.customer.findMany({
    where: { id: { startsWith: "seed_customer_" } },
    select: { id: true },
    orderBy: { id: "asc" },
    take: customerCount,
  });
  const products = await prisma.product.findMany({
    where: { id: { startsWith: "seed_product_" } },
    select: { id: true, price: true },
    orderBy: { id: "asc" },
    take: productCount,
  });

  const sales = Array.from({ length: 7_500 }, (_, index) => {
    const product = products[index % products.length];
    const customer = customers[index % customers.length];

    if (!product || !customer) {
      throw new Error("No se pudieron cargar los productos y clientes del seed.");
    }

    return {
      id: `seed_sale_${index + 1}`,
      amount: product.price,
      productId: product.id,
      customerId: customer.id,
      createdAt: faker.date.past({ years: 1 }),
    };
  });
  await prisma.sale.createMany({ data: sales, skipDuplicates: true });

  const statuses = [
    TaskStatus.PENDING,
    TaskStatus.IN_PROGRESS,
    TaskStatus.COMPLETED,
  ];
  await prisma.task.createMany({
    data: Array.from({ length: 15 }, (_, index) => ({
      id: `seed_task_${index + 1}`,
      title: `Tarea E-Commerce #${index + 1}: ${faker.hacker.phrase()}`,
      status: statuses[index % statuses.length],
      priority: faker.helpers.arrayElement(["LOW", "MEDIUM", "HIGH"]),
      position: index,
    })),
    skipDuplicates: true,
  });

  console.info(
    "Seed listo: hasta 10,515 registros de ejemplo, sin eliminar datos existentes.",
  );
}

main()
  .catch((error: unknown) => {
    console.error("Falló la carga de datos de ejemplo:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
