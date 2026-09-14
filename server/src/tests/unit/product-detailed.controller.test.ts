import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { getProductByIdController } from "../../controllers/product-detailed.controller.js";
import { getProductById } from "../../services/product-detailed.service.js";

vi.mock("../../services/product-detailed.service.js", () => ({
  getProductById: vi.fn(),
}));

describe("getProductByIdController", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;
  let jsonMock: ReturnType<typeof vi.fn>;
  let statusMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    jsonMock = vi.fn();
    statusMock = vi.fn().mockReturnValue({ json: jsonMock });

    req = { params: {} };
    res = { status: statusMock as any };
    next = vi.fn();
  });

  it("returns 400 when id param is missing", async () => {
    req.params = {} as any;

    await getProductByIdController(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Product ID is required",
    });
    expect(getProductById).not.toHaveBeenCalled();
  });

  it("returns 400 when id param is an empty/whitespace string", async () => {
    req.params = { id: "   " };

    await getProductByIdController(req as Request, res as Response, next);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Product ID is required",
    });
    expect(getProductById).not.toHaveBeenCalled();
  });

  it("returns 404 when product is not found", async () => {
    req.params = { id: "nonexistent-id" };
    (getProductById as any).mockResolvedValue(null);

    await getProductByIdController(req as Request, res as Response, next);

    expect(getProductById).toHaveBeenCalledWith("nonexistent-id");
    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      message: "Product not found",
    });
  });

  it("returns 200 with product data when product is found", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Test Product",
      price: 99.99,
      stock: 10,
    };
    req.params = { id: "prod-1" };
    (getProductById as any).mockResolvedValue(mockProduct);

    await getProductByIdController(req as Request, res as Response, next);

    expect(getProductById).toHaveBeenCalledWith("prod-1");
    expect(statusMock).toHaveBeenCalledWith(200);
    expect(jsonMock).toHaveBeenCalledWith({ data: mockProduct });
  });

  it("calls next with error when service throws", async () => {
    const error = new Error("Database error");
    req.params = { id: "prod-1" };
    (getProductById as any).mockRejectedValue(error);

    await getProductByIdController(req as Request, res as Response, next);

    expect(next).toHaveBeenCalledWith(error);
    expect(statusMock).not.toHaveBeenCalled();
  });
});