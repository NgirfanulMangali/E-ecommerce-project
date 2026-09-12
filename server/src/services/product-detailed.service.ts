import { prisma } from "../lib/prisma.js";
import type { ProductDetail } from "../types/product.type.js";

export const getProductById = async (
  id: string
): Promise<ProductDetail | null> => {
  const product = await prisma.product.findUnique({
    where: {
      id,
    },
  });

  if (!product) {
    return null;
  }

  return {
    ...product,
    price: Number(product.price),
  };
};