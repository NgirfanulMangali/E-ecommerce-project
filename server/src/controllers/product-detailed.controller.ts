import type { Request, Response, NextFunction } from "express";
import { getProductById } from "../services/product-detailed.service.js";

export const getProductByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    // 400 Bad Request
    if (typeof id !== "string" || id.trim() === "") {
      res.status(400).json({
        message: "Product ID is required",
      });
      return;
    }

    const product = await getProductById(id);

    // 404 Not Found
    if (!product) {
      res.status(404).json({
        message: "Product not found",
      });
      return;
    }

    // 200 OK
    res.status(200).json({
      data: product,
    });
  } catch (error) {
    // 500 Internal Server Error
    next(error);
  }
};