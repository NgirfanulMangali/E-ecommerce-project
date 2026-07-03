export type ProductType = "NEW_ARRIVAL" | "TOP_SELLING";


export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  type: ProductType;
  categoryId: string;
  
}