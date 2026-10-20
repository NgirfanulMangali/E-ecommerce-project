import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response } from "express";
import { addToCart, getCart } from "../../controllers/cart.controller.js";
import { addProductToCart, getCartByUserId } from "../../services/cart.service.js";
import { HttpError } from "../../types/cart.type.js";

vi.mock("../../services/cart.service.js", () => ({
  getCartByUserId: vi.fn(),
  addProductToCart: vi.fn(),
}));

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

const emptyCart = {
  id: null,
  userId: "user-1",
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

describe("cart.controller", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("GET returns 401 when req.user is missing", async () => {
    const req = { user: undefined } as Request;
    const res = mockResponse();

    await getCart(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(getCartByUserId).not.toHaveBeenCalled();
  });

  it("GET returns 200 with the user cart", async () => {
    vi.mocked(getCartByUserId).mockResolvedValue(emptyCart);

    const req = { user: { id: "user-1", email: "a@b.com" } } as Request;
    const res = mockResponse();

    await getCart(req, res);

    expect(getCartByUserId).toHaveBeenCalledWith("user-1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ data: emptyCart });
  });

  it("POST returns 400 when productId is missing", async () => {
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      body: { quantity: 1 },
    } as Request;
    const res = mockResponse();

    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(addProductToCart).not.toHaveBeenCalled();
  });

  it("POST returns 400 when quantity is invalid", async () => {
    const req = {
      user: { id: "user-1", email: "a@b.com" },
      body: { productId: "prod-1", quantity: 0 },
    } as Request;
    const res = mockResponse();

    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: "Quantity must be a positive integer",
      code: "VALIDATION_ERROR",
    });
  });

  it("POST returns 200 when a product is added", async () => {
    vi.mocked(addProductToCart).mockResolvedValue({
      ...emptyCart,
      id: "cart-1",
      totalItems: 1,
    });

    const req = {
      user: { id: "user-1", email: "a@b.com" },
      body: { productId: "prod-1" },
    } as Request;
    const res = mockResponse();

    await addToCart(req, res);

    expect(addProductToCart).toHaveBeenCalledWith("user-1", "prod-1", 1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product added to cart",
      data: {
        ...emptyCart,
        id: "cart-1",
        totalItems: 1,
      },
    });
  });

  it("POST maps HttpError from the service", async () => {
    vi.mocked(addProductToCart).mockRejectedValue(
      new HttpError("Product not found", 404)
    );

    const req = {
      user: { id: "user-1", email: "a@b.com" },
      body: { productId: "missing" },
    } as Request;
    const res = mockResponse();

    await addToCart(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: "Product not found",
    });
  });
});
