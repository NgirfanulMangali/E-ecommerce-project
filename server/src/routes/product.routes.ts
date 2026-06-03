import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    console.log("Sebelum query");

    const products = await prisma.product.findMany();

    console.log("Setelah query");

    res.json(products);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Query failed",
    });
  }
});

export default router;