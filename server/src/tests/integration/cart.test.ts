import { afterAll, afterEach, beforeAll, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { prisma, runMigrations, clearDb } from "./setup.js";
import { ProductType } from "../../generated/prisma/client.js";

describe("GET/POST /cart (integration)", () => {
  const user = {
    name: "Cart User",
    email: "cart-user@example.com",
    password: "password123",
  };

  beforeAll(async () => {
    await runMigrations();
  }, 60_000);

  afterEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
    await prisma.$disconnect();
  });

  async function createAuthedUser() {
    await request(app).post("/auth/register").send(user);
    const login = await request(app).post("/auth/login").send({
      email: user.email,
      password: user.password,
    });

    return {
      token: login.body.token as string,
      userId: login.body.data.id as string,
    };
  }

  async function createProduct() {
    const category = await prisma.category.create({
      data: { name: `Cart Category ${Date.now()}` },
    });

    return prisma.product.create({
      data: {
        name: "Cart Tee",
        description: "A product for the cart",
        price: 15,
        imageUrl: "/uploads/images/cart-tee.png",
        stock: 4,
        type: ProductType.NEW_ARRIVAL,
        categoryId: category.id,
      },
    });
  }

  it("rejects unauthenticated requests with 401", async () => {
    const getRes = await request(app).get("/cart");
    const postRes = await request(app)
      .post("/cart")
      .send({ productId: "prod-1" });

    expect(getRes.status).toBe(401);
    expect(postRes.status).toBe(401);
  });

  it("returns an empty cart for a logged-in user", async () => {
    const { token, userId } = await createAuthedUser();

    const res = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      id: null,
      userId,
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
  });

  it("adds a product and then returns it from GET /cart", async () => {
    const { token } = await createAuthedUser();
    const product = await createProduct();

    const addRes = await request(app)
      .post("/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: product.id, quantity: 2 });

    expect(addRes.status).toBe(200);
    expect(addRes.body.message).toBe("Product added to cart");
    expect(addRes.body.data.totalItems).toBe(2);
    expect(addRes.body.data.totalPrice).toBe(30);
    expect(addRes.body.data.items[0]).toMatchObject({
      productId: product.id,
      quantity: 2,
      lineTotal: 30,
    });

    const getRes = await request(app)
      .get("/cart")
      .set("Authorization", `Bearer ${token}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.items).toHaveLength(1);
    expect(getRes.body.data.items[0].product.name).toBe("Cart Tee");
  });

  it("returns 404 when adding a product that does not exist", async () => {
    const { token } = await createAuthedUser();

    const res = await request(app)
      .post("/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: "00000000-0000-0000-0000-000000000000" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Product not found");
  });
});
