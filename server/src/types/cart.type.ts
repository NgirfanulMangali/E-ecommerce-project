export class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

export interface AddToCartInput {
  productId: string;
  quantity?: number;
}

export interface CartProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
}

export interface CartItemResponse {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
  lineTotal: number;
}

export interface CartResponse {
  id: string | null;
  userId: string;
  items: CartItemResponse[];
  totalItems: number;
  totalPrice: number;
}
