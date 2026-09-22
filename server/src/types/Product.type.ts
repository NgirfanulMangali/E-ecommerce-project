import type { ProductType } from "../generated/prisma/client";

export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  type: ProductType;
  createdAt: Date;
  updatedAt: Date;
}
 