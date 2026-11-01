import type { OrderStatus } from "../generated/prisma/client";

export interface CreateOrderInput {
  status?: OrderStatus;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
}

export interface OrderResponse {
  id: string;
  status: OrderStatus;
}