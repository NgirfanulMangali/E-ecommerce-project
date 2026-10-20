import { describe, it, expect, vi, beforeEach } from "vitest";
import { addProductToCart, getCartByUserId } from "../../services/cart.service.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../types/cart.type.js";

vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    cart: {
      findUnique: vi.fn(),
      upsert: vi.fn(),
    },
    cartItem: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
    },
  },
}));

const product = {
  id: "prod-1",
  name: "Classic Tee",
  description: "A tee",
  price: 20,
  imageUrl: "/uploads/images/tee.png",
  stock: 5,
};

describe("cart.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns an empty cart when the user has none", async () => {
    vi.mocked(prisma.cart.findUnique).mockResolvedValue(null as never);

    const result = await getCartByUserId("user-1");

    expect(result).toEqual({
      id: null,
      userId: "user-1",
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  });

  it("maps cart items with numeric prices and line totals", async () => {
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          quantity: 2,
          product,
        },
      ],
    } as never);

    const result = await getCartByUserId("user-1");

    expect(result.totalItems).toBe(2);
    expect(result.totalPrice).toBe(40);
    expect(result.items[0].lineTotal).toBe(40);
    expect(result.items[0].product.price).toBe(20);
    expect(result.items[0].product.imageUrl).toBe(
      "http://localhost:5000/images/tee.png"
    );
  });

  it("throws 404 when adding a product that does not exist", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(null as never);

    await expect(addProductToCart("user-1", "missing", 1)).rejects.toMatchObject({
      message: "Product not found",
      status: 404,
    });
    expect(prisma.cart.upsert).not.toHaveBeenCalled();
  });

  it("throws 400 when the next quantity exceeds stock", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(product as never);
    vi.mocked(prisma.cart.upsert).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
    } as never);
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: "item-1",
      quantity: 4,
    } as never);

    await expect(addProductToCart("user-1", "prod-1", 2)).rejects.toBeInstanceOf(
      HttpError
    );
    await expect(addProductToCart("user-1", "prod-1", 2)).rejects.toMatchObject({
      message: "Not enough stock",
      status: 400,
    });
  });

  it("creates a cart item when the product is not already in the cart", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(product as never);
    vi.mocked(prisma.cart.upsert).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
    } as never);
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          quantity: 1,
          product,
        },
      ],
    } as never);

    const result = await addProductToCart("user-1", "prod-1", 1);

    expect(prisma.cartItem.create).toHaveBeenCalledWith({
      data: {
        cartId: "cart-1",
        productId: "prod-1",
        quantity: 1,
      },
    });
    expect(result.totalItems).toBe(1);
  });

  it("increments quantity when the product is already in the cart", async () => {
    vi.mocked(prisma.product.findUnique).mockResolvedValue(product as never);
    vi.mocked(prisma.cart.upsert).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
    } as never);
    vi.mocked(prisma.cartItem.findUnique).mockResolvedValue({
      id: "item-1",
      quantity: 1,
    } as never);
    vi.mocked(prisma.cart.findUnique).mockResolvedValue({
      id: "cart-1",
      userId: "user-1",
      items: [
        {
          id: "item-1",
          productId: "prod-1",
          quantity: 3,
          product,
        },
      ],
    } as never);

    await addProductToCart("user-1", "prod-1", 2);

    expect(prisma.cartItem.update).toHaveBeenCalledWith({
      where: { id: "item-1" },
      data: { quantity: 3 },
    });
    expect(prisma.cartItem.create).not.toHaveBeenCalled();
  });
});
