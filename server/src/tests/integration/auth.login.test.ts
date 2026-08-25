import { afterEach, afterAll, describe, it, expect } from "vitest";
import request from "supertest";
import { prisma, clearDb } from "./setup";
import app from "../../app";

afterEach(async () => {
  await clearDb();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("POST /auth/login", () => {
  const validUser = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "password123",
  };

  async function registerUser() {
    await request(app).post("/auth/register").send(validUser);
  }

  it("logs in with valid credentials and returns a token", async () => {
    await registerUser();

    const res = await request(app).post("/auth/login").send({
      email: validUser.email,
      password: validUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Login berhasil");
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.data).toMatchObject({
      name: validUser.name,
      email: validUser.email,
    });
    expect(res.body.data.password).toBeUndefined();
  }, 20000);

  it("rejects missing email or password with 400", async () => {
    const res = await request(app).post("/auth/login").send({
      email: validUser.email,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Email dan password harus diisi");
  }, 20000);

  it("rejects unknown email with 401", async () => {
    const res = await request(app).post("/auth/login").send({
      email: "unknown@example.com",
      password: validUser.password,
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email atau password salah");
  }, 20000);

  it("rejects wrong password with 401", async () => {
    await registerUser();

    const res = await request(app).post("/auth/login").send({
      email: validUser.email,
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Email atau password salah");
  }, 20000);
});
