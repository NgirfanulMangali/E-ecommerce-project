import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Request, Response } from "express";
import { OrderStatus } from "../../generated/prisma/client";
import * as controller from "../../controllers/order.controller";
import * as orderService from "../../services/order.service";

vi.mock("../../services/order.service", () => ({
  createOrder: vi.fn(),
  getAllOrders: vi.fn(),
  getOrderById: vi.fn(),
  updateOrderStatus: vi.fn(),
}));

const [statusA, statusB] = Object.values(OrderStatus);

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as typeof res & Response;
}

function mockReq(overrides: Partial<Request> = {}) {
  return { params: {}, body: {}, ...overrides } as Request;
}

describe("order.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createOrder", () => {
    it("returns 201 with the created order", async () => {
      const order = { id: "o1", status: statusA };
      vi.mocked(orderService.createOrder).mockResolvedValue(order as any);
      const res = mockRes();

      await controller.createOrder(mockReq({ body: { status: statusA } }), res);

      expect(orderService.createOrder).toHaveBeenCalledWith({ status: statusA });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it("accepts a missing status (uses DB default)", async () => {
      vi.mocked(orderService.createOrder).mockResolvedValue({ id: "o1", status: statusA } as any);
      const res = mockRes();

      await controller.createOrder(mockReq({ body: {} }), res);

      expect(orderService.createOrder).toHaveBeenCalledWith({ status: undefined });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("returns 400 for an invalid status and does not call the service", async () => {
      const res = mockRes();

      await controller.createOrder(mockReq({ body: { status: "NOT_A_STATUS" } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: expect.stringContaining("Status tidak valid"),
      });
      expect(orderService.createOrder).not.toHaveBeenCalled();
    });

    it("returns 400 when status is not a string", async () => {
      const res = mockRes();

      await controller.createOrder(mockReq({ body: { status: 123 } }), res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("returns 500 when the service throws", async () => {
      vi.mocked(orderService.createOrder).mockRejectedValue(new Error("db"));
      const res = mockRes();

      await controller.createOrder(mockReq({ body: {} }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Gagal membuat order" });
    });
  });

  describe("getAllOrders", () => {
    it("returns the list of orders", async () => {
      const orders = [{ id: "o1", status: statusA }];
      vi.mocked(orderService.getAllOrders).mockResolvedValue(orders as any);
      const res = mockRes();

      await controller.getAllOrders(mockReq(), res);

      expect(res.json).toHaveBeenCalledWith(orders);
      expect(res.status).not.toHaveBeenCalled(); // implicit 200
    });

    it("returns 500 when the service throws", async () => {
      vi.mocked(orderService.getAllOrders).mockRejectedValue(new Error("db"));
      const res = mockRes();

      await controller.getAllOrders(mockReq(), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Gagal mengambil data order" });
    });
  });

  describe("getOrderById", () => {
    it("returns the order when found", async () => {
      const order = { id: "o1", status: statusA };
      vi.mocked(orderService.getOrderById).mockResolvedValue(order as any);
      const res = mockRes();

      await controller.getOrderById(mockReq({ params: { id: "o1" } }), res);

      expect(orderService.getOrderById).toHaveBeenCalledWith("o1");
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it("returns 404 when the order does not exist", async () => {
      vi.mocked(orderService.getOrderById).mockResolvedValue(null);
      const res = mockRes();

      await controller.getOrderById(mockReq({ params: { id: "missing" } }), res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order tidak ditemukan" });
    });

    it("returns 500 when the service throws", async () => {
      vi.mocked(orderService.getOrderById).mockRejectedValue(new Error("db"));
      const res = mockRes();

      await controller.getOrderById(mockReq({ params: { id: "o1" } }), res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Gagal mengambil order" });
    });
  });

  describe("updateOrderStatus", () => {
    it("updates and returns the order", async () => {
      const order = { id: "o1", status: statusB };
      vi.mocked(orderService.updateOrderStatus).mockResolvedValue(order as any);
      const res = mockRes();

      await controller.updateOrderStatus(
        mockReq({ params: { id: "o1" }, body: { status: statusB } }),
        res
      );

      expect(orderService.updateOrderStatus).toHaveBeenCalledWith("o1", { status: statusB });
      expect(res.json).toHaveBeenCalledWith(order);
    });

    it("returns 400 when status is missing", async () => {
      const res = mockRes();

      await controller.updateOrderStatus(mockReq({ params: { id: "o1" }, body: {} }), res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
    });

    it("returns 400 when status is invalid", async () => {
      const res = mockRes();

      await controller.updateOrderStatus(
        mockReq({ params: { id: "o1" }, body: { status: "BOGUS" } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(400);
      expect(orderService.updateOrderStatus).not.toHaveBeenCalled();
    });

    it("returns 404 when prisma throws P2025", async () => {
      vi.mocked(orderService.updateOrderStatus).mockRejectedValue(
        Object.assign(new Error("not found"), { code: "P2025" })
      );
      const res = mockRes();

      await controller.updateOrderStatus(
        mockReq({ params: { id: "missing" }, body: { status: statusA } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Order tidak ditemukan" });
    });

    it("returns 500 for any other error", async () => {
      vi.mocked(orderService.updateOrderStatus).mockRejectedValue(new Error("db"));
      const res = mockRes();

      await controller.updateOrderStatus(
        mockReq({ params: { id: "o1" }, body: { status: statusA } }),
        res
      );

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ message: "Gagal mengubah status order" });
    });
  });
});