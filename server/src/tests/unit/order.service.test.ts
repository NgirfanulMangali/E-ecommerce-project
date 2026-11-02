import { describe, it, expect, vi, beforeEach } from "vitest";
import { OrderStatus } from "../../generated/prisma/client";
import * as orderService from "../../services/order.service";
import { prisma } from "../../lib/prisma.js";

vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    order: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

const [statusA, statusB] = Object.values(OrderStatus);
const select = { id: true, status: true };

describe("order.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createOrder", () => {
    it("creates an order with the given status and selects only id/status", async () => {
      vi.mocked(prisma.order.create).mockResolvedValue({ id: "o1", status: statusA } as any);

      const result = await orderService.createOrder({ status: statusA });

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: { status: statusA },
        select,
      });
      expect(result).toEqual({ id: "o1", status: statusA });
    });

    it("passes an undefined status so the DB default applies", async () => {
      vi.mocked(prisma.order.create).mockResolvedValue({ id: "o2", status: statusA } as any);

      await orderService.createOrder({});

      expect(prisma.order.create).toHaveBeenCalledWith({
        data: { status: undefined },
        select,
      });
    });

    it("propagates prisma errors", async () => {
      vi.mocked(prisma.order.create).mockRejectedValue(new Error("db down"));

      await expect(orderService.createOrder({})).rejects.toThrow("db down");
    });
  });

  describe("getAllOrders", () => {
    it("returns all orders sorted by createdAt desc", async () => {
      const orders = [
        { id: "o2", status: statusB },
        { id: "o1", status: statusA },
      ];
      vi.mocked(prisma.order.findMany).mockResolvedValue(orders as any);

      const result = await orderService.getAllOrders();

      expect(prisma.order.findMany).toHaveBeenCalledWith({
        select,
        orderBy: { createdAt: "desc" },
      });
      expect(result).toEqual(orders);
    });

    it("returns an empty array when there are no orders", async () => {
      vi.mocked(prisma.order.findMany).mockResolvedValue([]);

      expect(await orderService.getAllOrders()).toEqual([]);
    });
  });

  describe("getOrderById", () => {
    it("returns the order when found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue({ id: "o1", status: statusA } as any);

      const result = await orderService.getOrderById("o1");

      expect(prisma.order.findUnique).toHaveBeenCalledWith({
        where: { id: "o1" },
        select,
      });
      expect(result).toEqual({ id: "o1", status: statusA });
    });

    it("returns null when not found", async () => {
      vi.mocked(prisma.order.findUnique).mockResolvedValue(null);

      expect(await orderService.getOrderById("missing")).toBeNull();
    });
  });

  describe("updateOrderStatus", () => {
    it("updates the status and returns the updated order", async () => {
      vi.mocked(prisma.order.update).mockResolvedValue({ id: "o1", status: statusB } as any);

      const result = await orderService.updateOrderStatus("o1", { status: statusB });

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: "o1" },
        data: { status: statusB },
        select,
      });
      expect(result).toEqual({ id: "o1", status: statusB });
    });

    it("propagates errors such as P2025 (record not found)", async () => {
      const err = Object.assign(new Error("not found"), { code: "P2025" });
      vi.mocked(prisma.order.update).mockRejectedValue(err);

      await expect(
        orderService.updateOrderStatus("missing", { status: statusA })
      ).rejects.toMatchObject({ code: "P2025" });
    });
  });
});