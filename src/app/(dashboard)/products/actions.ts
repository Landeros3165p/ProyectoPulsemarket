"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import {
  bulkUpdateCategorySchema,
  productSchema,
} from "@/lib/validators/schemas";

const pageSize = 15;

export async function getPaginatedProducts(requestedPage = 1) {
  await requireSession();

  if (!Number.isInteger(requestedPage) || requestedPage < 1) {
    throw new RangeError("El número de página debe ser un entero positivo.");
  }

  const total = await db.product.count({ where: { deletedAt: null } });
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(requestedPage, totalPages);
  const products = await db.product.findMany({
    where: { deletedAt: null },
    take: pageSize,
    skip: (currentPage - 1) * pageSize,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      category: true,
      price: true,
      stock: true,
      sku: true,
    },
  });

  return { products, totalPages, currentPage };
}

export async function createProduct(rawInput: unknown) {
  await requireSession();
  const input = productSchema.parse(rawInput);
  const product = await db.product.create({ data: input });

  revalidatePath("/products");
  return { success: true, productId: product.id };
}

export async function bulkUpdateCategoryPrice(rawInput: unknown) {
  await requireSession();
  const input = bulkUpdateCategorySchema.parse(rawInput);
  const factor = 1 + input.percentageAdjustment / 100;

  const categoryProducts = await db.product.findMany({
    where: { category: input.category, deletedAt: null },
    select: { id: true, price: true },
  });

  const updates = categoryProducts.map((product) =>
    db.product.update({
      where: { id: product.id },
      data: { price: Number((product.price * factor).toFixed(2)) },
    }),
  );

  await db.$transaction(updates);
  revalidatePath("/products");
  return { success: true, count: updates.length };
}

export async function softDeleteProduct(productId: string) {
  await requireSession();
  const id = productId.trim();

  if (!id) {
    throw new TypeError("El identificador del producto es obligatorio.");
  }

  await db.product.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/products");
  return { success: true };
}
