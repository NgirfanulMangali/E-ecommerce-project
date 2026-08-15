import { Request, Response } from "express";
import { getAllProducts } from "../services/product.service";

export async function getProducts(req: Request, res: Response) {
  try {
    const products = await getAllProducts();

   return res.status(200).json({
    data: products,
  })
  } catch{
    return res.status(500).json({
      message: "An internal server error occurred. Please try again later.",
      code: "INTERNAL_SERVER_ERROR",
    });
  }
}