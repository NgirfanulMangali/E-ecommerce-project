import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { getProducts } from "../../controllers/product.controller.js";
import { getAllProducts } from "../../services/product.service.js";

vi.mock("../../services/product.service.js", () => ({
  getAllProducts: vi.fn(),
}));

function createMockResponse() {
  const res = {} as Response;
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe("getProducts controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with product data on success", async () => {
    const mockProducts = [
      { id: "1", name: "Product A", price: 10, imageUrl: "http://x/images/a.png" },
    ];
    vi.mocked(getAllProducts).mockResolvedValue(mockProducts as any);

    const req = {} as Request;
    const res = createMockResponse();

    await getProducts(req, res);

    expect(getAllProducts).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: mockProducts });
  });

  it("returns 200 with an empty array when there are no products", async () => {
    vi.mocked(getAllProducts).mockResolvedValue([]);

    const req = {} as Request;
    const res = createMockResponse();

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: [] });
  });

  it("returns 500 with a generic error message when the service throws", async () => {
    vi.mocked(getAllProducts).mockRejectedValue(new Error("DB connection failed"));

    const req = {} as Request;
    const res = createMockResponse();

    await getProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "An internal server error occurred. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
    });
  });

  it("does not leak internal error details in the response", async () => {
    vi.mocked(getAllProducts).mockRejectedValue(new Error("sensitive db info"));

    const req = {} as Request;
    const res = createMockResponse();

    await getProducts(req, res);

    const jsonArg = vi.mocked(res.json).mock.calls[0][0];
    expect(JSON.stringify(jsonArg)).not.toContain("sensitive db info");
  });
});