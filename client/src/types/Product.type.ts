import type { ProductType } from "./product";


export interface ProductDetail {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  categoryId: string;
  type: ProductType;
  createdAt: string;
  updatedAt: string;
}
 
// UI-only selections — the backend has no color/size variant model yet.
export interface ColorOption {
  id: string;
  hex: string;
  name: string;
}
 
export interface SizeOption {
  id: string;
  label: string;
}
 
  