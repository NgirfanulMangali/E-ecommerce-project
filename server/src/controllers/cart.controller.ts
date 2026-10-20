import type { Request, Response } from "express";
import { addProductToCart, getCartByUserId } from "../services/cart.service.js";
import { HttpError } from "../types/cart.type.js";

function parseQuantity(value: unknown): number | null {
  if (value === undefined) {
    return 1;
  }

  if (typeof value !== "number" || !Number.isInteger(value) || value < 1) {
    return null;
  }

  return value;
}

export async function getCart(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        code: "UNAUTHENTICATED",
      });
    }

    const cart = await getCartByUserId(req.user.id);

    return res.status(200).json({
      data: cart,
    });
  } catch {
    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}

export async function addToCart(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required",
        code: "UNAUTHENTICATED",
      });
    }

    const { productId, quantity } = req.body as {
      productId?: unknown;
      quantity?: unknown;
    };

    if (typeof productId !== "string" || productId.trim() === "") {
      return res.status(400).json({
        message: "Product ID is required",
        code: "VALIDATION_ERROR",
      });
    }

    const parsedQuantity = parseQuantity(quantity);
    if (parsedQuantity === null) {
      return res.status(400).json({
        message: "Quantity must be a positive integer",
        code: "VALIDATION_ERROR",
      });
    }

    const cart = await addProductToCart(
      req.user.id,
      productId.trim(),
      parsedQuantity
    );

    return res.status(200).json({
      message: "Product added to cart",
      data: cart,
    });
  } catch (error) {
    if (error instanceof HttpError) {
      return res.status(error.status).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}
