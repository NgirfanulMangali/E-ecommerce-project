import { prisma } from "../lib/prisma.js";
import type { ProductDetail } from "../types/Product.type.js";

const PUBLIC_BASE_URL = process.env.PUBLIC_BASE_URL ?? "http://localhost:5000";

function toPublicImageUrl(imageUrl: string): string {
  const match = imageUrl.match(/images\/(.+)$/i);
  if (!match) return imageUrl;
  return `${PUBLIC_BASE_URL}/images/${match[1]}`;
}

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
    imageUrl: toPublicImageUrl(product.imageUrl),
  };
};