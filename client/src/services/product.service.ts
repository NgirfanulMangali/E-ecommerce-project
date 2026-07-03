import type { Product } from "../types/product";

export const getProducts = async (): Promise<Product[]> => {
  const response = await fetch(
    "http://localhost:5000/products"
  );

  if (!response.ok) {
     const errorBody = await response.json().catch(() => null);
     throw new Error(errorBody?.message || "Failed to fetch products");
  }

  const products: { data: Product[] } = await response.json();

  return products.data;
};