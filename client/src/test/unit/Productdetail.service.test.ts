import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { productService, ApiError } from "../../services/Productdetail.service";
import type { ProductDetail } from "../../types/Product.type";

const mockProduct: ProductDetail = {
  id: "prod-1",
  name: "Wireless Mouse",
  description: "A test product",
  price: 29.99,
  imageUrl: "https://example.com/mouse.jpg",
  stock: 10,
  categoryId: "cat-1",
  type: "NEW_ARRIVAL" as any,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

describe("productService.getById", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns product data when the response is ok", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProduct }),
    });

    const result = await productService.getById("prod-1");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/products/prod-1"),
      expect.objectContaining({ signal: undefined })
    );
    expect(result).toEqual(mockProduct);
  });

  it("throws ApiError with backend message on 404", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      json: async () => ({ message: "Product not found" }),
    });

    await expect(productService.getById("missing-id")).rejects.toMatchObject({
      name: "ApiError",
      message: "Product not found",
      status: 404,
    });
  });

  it("throws ApiError with statusText fallback when body has no message", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      json: async () => {
        throw new Error("invalid json");
      },
    });

    await expect(productService.getById("prod-1")).rejects.toMatchObject({
      message: "Internal Server Error",
      status: 500,
    });
  });

  it("passes an AbortSignal through to fetch when provided", async () => {
    const controller = new AbortController();
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockProduct }),
    });

    await productService.getById("prod-1", controller.signal);

    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ signal: controller.signal })
    );
  });

  it("is an instance of ApiError with correct properties", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ message: "Product ID is required" }),
    });

    try {
      await productService.getById("");
      expect.fail("should have thrown");
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(400);
    }
  });
});