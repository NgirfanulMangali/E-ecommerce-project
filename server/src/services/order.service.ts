import { prisma } from "../lib/prisma.js";
import {
  CreateOrderInput,
  OrderResponse,
  UpdateOrderStatusInput,
} from "../types/order.type";


const select = { id: true, status: true } as const;

export const createOrder = async (
  data: CreateOrderInput
): Promise<OrderResponse> => {
  return prisma.order.create({
    data: { status: data.status },
    select,
  });
};

export const getAllOrders = async (): Promise<OrderResponse[]> => {
  return prisma.order.findMany({ select, orderBy: { createdAt: "desc" } });
};

export const getOrderById = async (
  id: string
): Promise<OrderResponse | null> => {
  return prisma.order.findUnique({ where: { id }, select });
};

export const updateOrderStatus = async (
  id: string,
  data: UpdateOrderStatusInput
): Promise<OrderResponse> => {
  return prisma.order.update({
    where: { id },
    data: { status: data.status },
    select,
  });
};