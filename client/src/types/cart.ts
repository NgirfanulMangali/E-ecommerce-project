import type { ProductType } from "./product";

export interface CartProduct {
    id: string;
    name: string;
    price: number;
    imageUrl: string;
    type: ProductType;
  }

  export interface CartItem {
    productId: string;
    quantity: number;
    lineTotal: number;
    product: CartProduct;
  }

export interface Cart {
    id: string | null;
    userId: string;
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
  }

  export interface CartResponse {
    message?: string;
    data: Cart;
  }