import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma, runMigrations, clearDb } from "./setup.js";
import { ProductType } from "../../generated/prisma/client.js";

describe("GET /products/:id (integration)", () => {
  let categoryId: string;
  let productId: string;

  beforeAll(() => {
    runMigrations();
  });

  beforeEach(async () => {
    await clearDb();

    const category = await prisma.category.create({
      data: { name: "Electronics" },
    });
    categoryId = category.id;

    const product = await prisma.product.create({
      data: {
        name: "Wireless Mouse",
        description: "A test product",
        price: 29.99,
        imageUrl: "https://example.com/images/wireless-mouse.jpg",
        stock: 50,
        type: ProductType.NEW_ARRIVAL,
        categoryId,
      },
    });
    productId = product.id;
  });

  afterAll(async () => {
    await clearDb();
    await prisma.$disconnect();
  });

  it("returns 200 and the product when it exists", async () => {
    const res = await request(app).get(`/products/${productId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: productId,
      name: "Wireless Mouse",
      price: 29.99,
    });
    expect(typeof res.body.data.price).toBe("number");
  });

  it("returns 404 when the product does not exist", async () => {
    const nonExistentId = "00000000-0000-0000-0000-000000000000";

    const res = await request(app).get(`/products/${nonExistentId}`);

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ message: "Product not found" });
  });

  it("returns 400 when the id param is empty/whitespace", async () => {
    // depends on your router — only works if the route allows an empty segment
    const res = await request(app).get("/products/%20"); // encoded space

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ message: "Product ID is required" });
  });

});