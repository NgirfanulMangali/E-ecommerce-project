import { beforeAll, afterEach, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { prisma, runMigrations, clearDb } from "./setup";
import app from "../../app";

beforeAll(() => {
  runMigrations();
});

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /auth/register", () => {
  const validUser = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
  };

  it(
    "registers a user and returns 201 with no password in response",
    async () => {
    const res = await request(app).post("/auth/register").send(validUser);

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Registration successful");
    expect(res.body.data).toMatchObject({
      name: validUser.name,
      email: validUser.email,
    });
    expect(res.body.data.password).toBeUndefined();
    },
    20000,
  );

  it("actually persists the user with a hashed password", async () => {
    await request(app).post("/auth/register").send(validUser);

    const userInDb = await prisma.user.findUnique({
      where: { email: validUser.email },
    });

    expect(userInDb).not.toBeNull();
    expect(userInDb!.password).not.toBe(validUser.password); // hashed, not plaintext
  }, 20000);

  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ email: validUser.email, password: validUser.password }); // no name

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("MISSING_FIELDS");
  }, 20000);

  it("rejects invalid email format with 400", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validUser, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_ERROR");
  }, 20000);

  it("rejects password shorter than 10 chars", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validUser, password: "short1" });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PASSWORD_TOO_SHORT");
  }, 20000);

  it("rejects password longer than 20 chars", async () => {
    const res = await request(app)
      .post("/auth/register")
      .send({ ...validUser, password: "a".repeat(21) });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe("PASSWORD_TOO_LONG");
  }, 20000);

  it("rejects duplicate email with 409", async () => {
    await request(app).post("/auth/register").send(validUser);
    const res = await request(app).post("/auth/register").send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.code).toBe("EMAIL_ALREADY_EXISTS");
  }, 20000);
});