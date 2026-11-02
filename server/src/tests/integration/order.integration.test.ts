import { describe, it, expect, beforeAll, beforeEach, afterAll } from "vitest";
import request from "supertest";
import app from "../../app.js";
import { OrderStatus } from "../../generated/prisma/client.js";
import { prisma, runMigrations, clearDb } from "./setup.js";

const [statusA, statusB] = Object.values(OrderStatus);
const missingId = "clxxxxxxxxxxxxxxxxxxxxxxx"; // cuid-shaped, doesn't exist

describe("Orders API (integration)", () => {
  beforeAll(() => {
    runMigrations();
  });

  beforeEach(async () => {
    await clearDb();
  });

  afterAll(async () => {
    await clearDb();
    await prisma.$disconnect();
  });

  describe("POST /orders", () => {
    it("creates an order with the given status", async () => {
      const res = await request(app).post("/orders").send({ status: statusB });

      expect(res.status).toBe(201);
      expect(res.body).toEqual({ id: expect.any(String), status: statusB });

      const inDb = await prisma.order.findUnique({ where: { id: res.body.id } });
      expect(inDb?.status).toBe(statusB);
    });

    it("creates an order with the default status when none is sent", async () => {
      const res = await request(app).post("/orders").send({});

      expect(res.status).toBe(201);
      expect(Object.values(OrderStatus)).toContain(res.body.status);
    });

    it("returns 400 for an invalid status and creates nothing", async () => {
      const res = await request(app).post("/orders").send({ status: "NOPE" });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Status tidak valid");
      expect(await prisma.order.count()).toBe(0);
    });
  });

  describe("GET /orders", () => {
    it("returns an empty array when there are no orders", async () => {
      const res = await request(app).get("/orders");

      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it("returns orders newest first", async () => {
      const older = await prisma.order.create({
        data: { status: statusA, createdAt: new Date("2025-01-01") },
      });
      const newer = await prisma.order.create({
        data: { status: statusB, createdAt: new Date("2025-06-01") },
      });

      const res = await request(app).get("/orders");

      expect(res.status).toBe(200);
      expect(res.body.map((o: { id: string }) => o.id)).toEqual([newer.id, older.id]);
      expect(res.body[0]).toEqual({ id: newer.id, status: statusB }); // only id + status
    });
  });

  describe("GET /orders/:id", () => {
    it("returns the order when it exists", async () => {
      const order = await prisma.order.create({ data: { status: statusA } });

      const res = await request(app).get(`/orders/${order.id}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: order.id, status: statusA });
    });

    it("returns 404 when it does not exist", async () => {
      const res = await request(app).get(`/orders/${missingId}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Order tidak ditemukan" });
    });
  });

  describe("PATCH /orders/:id/status", () => {
    it("updates the status", async () => {
      const order = await prisma.order.create({ data: { status: statusA } });

      const res = await request(app)
        .patch(`/orders/${order.id}/status`)
        .send({ status: statusB });

      expect(res.status).toBe(200);
      expect(res.body).toEqual({ id: order.id, status: statusB });

      const inDb = await prisma.order.findUnique({ where: { id: order.id } });
      expect(inDb?.status).toBe(statusB);
    });

    it("returns 400 for an invalid status and leaves the order unchanged", async () => {
      const order = await prisma.order.create({ data: { status: statusA } });

      const res = await request(app)
        .patch(`/orders/${order.id}/status`)
        .send({ status: "NOPE" });

      expect(res.status).toBe(400);
      const inDb = await prisma.order.findUnique({ where: { id: order.id } });
      expect(inDb?.status).toBe(statusA);
    });

    it("returns 404 when the order does not exist (real P2025)", async () => {
      const res = await request(app)
        .patch(`/orders/${missingId}/status`)
        .send({ status: statusA });

      expect(res.status).toBe(404);
      expect(res.body).toEqual({ message: "Order tidak ditemukan" });
    });
  });
});