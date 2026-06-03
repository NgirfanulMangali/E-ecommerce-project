import type { Product } from "../types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(
    "http://localhost:5000/api/products"
  );

  if (!response.ok) {
    throw new Error("Failed to fetch products");
  }

  const products: Product[] = await response.json();

  return products;
};