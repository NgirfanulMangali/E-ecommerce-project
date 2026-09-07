import { describe, it, expect, afterAll, beforeEach } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma, clearDb } from "./setup.js";

describe("GET /products (integration)", () => {
  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
    await prisma.$disconnect();
  });

  async function createTestCategory() {
    return prisma.category.create({
      data: { name: "Test Category" },
    });
  }

  it("returns 200 with an empty array when there are no products", async () => {
    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ data: [] });
  });

  it("returns 200 with all seeded products", async () => {
    const category = await createTestCategory();

    await prisma.product.createMany({
      data: [
        {
          name: "Product A",
          description: "Test description A",
          price: 19.99,
          stock: 10,
          imageUrl: "/uploads/images/a.png",
          categoryId: category.id,
          type: "NEW_ARRIVAL",
        },
        {
          name: "Product B",
          description: "Test description B",
          price: 49.5,
          stock: 5,
          imageUrl: "/uploads/images/b.png",
          categoryId: category.id,
          type: "TOP_SELLING",
        },
      ],
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);

    const names = res.body.data.map((p: any) => p.name).sort();
    expect(names).toEqual(["Product A", "Product B"]);
  });

  it("converts price to a plain number in the response", async () => {
    const category = await createTestCategory();

    await prisma.product.create({
      data: {
        name: "Priced Item",
        description: "Test description",
        price: 123.45,
        stock: 1,
        imageUrl: "/uploads/images/c.png",
        categoryId: category.id,
        type: "NEW_ARRIVAL",
      },
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(typeof res.body.data[0].price).toBe("number");
    expect(res.body.data[0].price).toBe(123.45);
  });

  it("rewrites imageUrl using PUBLIC_BASE_URL", async () => {
    const category = await createTestCategory();

    await prisma.product.create({
      data: {
        name: "Image Item",
        description: "Test description",
        price: 10,
        stock: 1,
        imageUrl: "/some/local/path/images/photo.png",
        categoryId: category.id,
        type: "TOP_SELLING",
      },
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    const expectedBase = process.env.PUBLIC_BASE_URL ?? "http://localhost:5000";
    expect(res.body.data[0].imageUrl).toBe(`${expectedBase}/images/photo.png`);
  });

  it("returns each product with its category relation fields intact", async () => {
    const category = await createTestCategory();

    await prisma.product.create({
      data: {
        name: "Categorized Item",
        description: "Test description",
        price: 5,
        stock: 3,
        imageUrl: "/uploads/images/d.png",
        categoryId: category.id,
        type: "NEW_ARRIVAL",
      },
    });

    const res = await request(app).get("/products");

    expect(res.status).toBe(200);
    expect(res.body.data[0].categoryId).toBe(category.id);
  });
});