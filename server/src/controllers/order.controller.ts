import { Request, Response } from "express";
import { OrderStatus } from "../generated/prisma/client";
import * as orderService from "../services/order.service";

const isValidStatus = (value: unknown): value is OrderStatus =>
  typeof value === "string" &&
  Object.values(OrderStatus).includes(value as OrderStatus);

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (status !== undefined && !isValidStatus(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Pilih: ${Object.values(OrderStatus).join(", ")}`,
      });
    }

    const order = await orderService.createOrder({ status });
    return res.status(201).json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal membuat order" });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await orderService.getAllOrders();
    return res.json(orders);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil data order" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const order = await orderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    return res.json(order);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Gagal mengambil order" });
  }
};

export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!isValidStatus(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Pilih: ${Object.values(OrderStatus).join(", ")}`,
      });
    }

    const order = await orderService.updateOrderStatus(id, {
      status,
    });
    return res.json(order);
  } catch (error: any) {
    if (error?.code === "P2025") {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }
    console.error(error);
    return res.status(500).json({ message: "Gagal mengubah status order" });
  }
};