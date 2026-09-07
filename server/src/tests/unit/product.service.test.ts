// src/tests/unit/product.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { prisma } from "../../lib/prisma.js";

vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    product: {
      findMany: vi.fn(),
    },
  },
}));

describe("getAllProducts service", () => {
  const ORIGINAL_ENV = process.env.PUBLIC_BASE_URL;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    process.env.PUBLIC_BASE_URL = ORIGINAL_ENV;
    vi.resetModules();
  });

  it("returns products with price converted to a number", async () => {
    const { getAllProducts } = await import("../../services/product.service.js");
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "1",
        name: "Product A",
        price: { toString: () => "19.99" } as any,
        imageUrl: "/uploads/images/a.png",
      },
    ] as any);

    const result = await getAllProducts();

    expect(result[0].price).toBe(19.99);
    expect(typeof result[0].price).toBe("number");
  });

  it("rewrites imageUrl to use PUBLIC_BASE_URL", async () => {
    process.env.PUBLIC_BASE_URL = "https://cdn.example.com";
    vi.resetModules(); // clear the cached module so it re-reads process.env
    const { getAllProducts } = await import("../../services/product.service.js");

    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "1",
        name: "Product A",
        price: 10,
        imageUrl: "/some/local/path/images/a.png",
      },
    ] as any);

    const result = await getAllProducts();

    expect(result[0].imageUrl).toBe("https://cdn.example.com/images/a.png");
  });

  it("leaves imageUrl unchanged when it doesn't contain an 'images/' segment", async () => {
    const { getAllProducts } = await import("../../services/product.service.js");
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        id: "1",
        name: "Product A",
        price: 10,
        imageUrl: "https://other-cdn.com/no-match-here.png",
      },
    ] as any);

    const result = await getAllProducts();

    expect(result[0].imageUrl).toBe("https://other-cdn.com/no-match-here.png");
  });

  it("returns an empty array when there are no products", async () => {
    const { getAllProducts } = await import("../../services/product.service.js");
    vi.mocked(prisma.product.findMany).mockResolvedValue([]);

    const result = await getAllProducts();

    expect(result).toEqual([]);
  });

  it("propagates errors from prisma", async () => {
    const { getAllProducts } = await import("../../services/product.service.js");
    vi.mocked(prisma.product.findMany).mockRejectedValue(new Error("DB error"));

    await expect(getAllProducts()).rejects.toThrow("DB error");
  });
});