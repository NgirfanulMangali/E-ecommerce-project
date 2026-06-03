import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

export const getProducts = async (
  req: Request,
  res: Response
) => {
  console.log("Controller masuk");

  res.json({
    status: "ok",
  });
};