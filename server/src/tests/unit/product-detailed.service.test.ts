import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductById } from "../../services/product-detailed.service.js";
import { prisma } from "../../lib/prisma.js";

// Mock the prisma client
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    product: {
      findUnique: vi.fn(),
    },
  },
}));

describe("getProductById", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns product with price converted to number when found", async () => {
    const mockProduct = {
      id: "prod-1",
      name: "Test Product",
      description: "A test product",
      price: { toString: () => "99.99" } as any, // simulate Prisma Decimal
      stock: 10,
    };

    // Prisma Decimal supports Number() conversion; mock accordingly
    (prisma.product.findUnique as any).mockResolvedValue({
      ...mockProduct,
      price: 99.99,
    });

    const result = await getProductById("prod-1");

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: "prod-1" },
    });
    expect(result).toEqual({
      ...mockProduct,
      price: 99.99,
    });
    expect(typeof result?.price).toBe("number");
  });

  it("returns null when product is not found", async () => {
    (prisma.product.findUnique as any).mockResolvedValue(null);

    const result = await getProductById("nonexistent-id");

    expect(prisma.product.findUnique).toHaveBeenCalledWith({
      where: { id: "nonexistent-id" },
    });
    expect(result).toBeNull();
  });

  it("correctly converts a Decimal-like price value to a number", async () => {
    (prisma.product.findUnique as any).mockResolvedValue({
      id: "prod-2",
      name: "Decimal Product",
      price: "150.5", // Prisma Decimal often serializes as string-like
      stock: 5,
    });

    const result = await getProductById("prod-2");

    expect(result?.price).toBe(150.5);
    expect(typeof result?.price).toBe("number");
  });

  it("propagates errors thrown by prisma", async () => {
    const dbError = new Error("Database connection failed");
    (prisma.product.findUnique as any).mockRejectedValue(dbError);

    await expect(getProductById("prod-1")).rejects.toThrow(
      "Database connection failed"
    );
  });
});