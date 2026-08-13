"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const setup_1 = require("./setup");
const app_1 = __importDefault(require("../../app"));
(0, vitest_1.beforeAll)(() => {
    (0, setup_1.runMigrations)();
});
(0, vitest_1.afterEach)(async () => {
    await (0, setup_1.clearDb)();
});
(0, vitest_1.afterAll)(async () => {
    await setup_1.prisma.$disconnect();
});
(0, vitest_1.describe)("POST /auth/register", () => {
    const validUser = {
        name: "Jane Doe",
        email: "jane@example.com",
        password: "password123",
    };
    (0, vitest_1.it)("registers a user and returns 201 with no password in response", async () => {
        const res = await (0, supertest_1.default)(app_1.default).post("/auth/register").send(validUser);
        (0, vitest_1.expect)(res.status).toBe(201);
        (0, vitest_1.expect)(res.body.message).toBe("Registration successful");
        (0, vitest_1.expect)(res.body.data).toMatchObject({
            name: validUser.name,
            email: validUser.email,
        });
        (0, vitest_1.expect)(res.body.data.password).toBeUndefined();
    }, 20000);
    (0, vitest_1.it)("actually persists the user with a hashed password", async () => {
        await (0, supertest_1.default)(app_1.default).post("/auth/register").send(validUser);
        const userInDb = await setup_1.prisma.user.findUnique({
            where: { email: validUser.email },
        });
        (0, vitest_1.expect)(userInDb).not.toBeNull();
        (0, vitest_1.expect)(userInDb.password).not.toBe(validUser.password); // hashed, not plaintext
    }, 20000);
    (0, vitest_1.it)("rejects missing fields with 400", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/register")
            .send({ email: validUser.email, password: validUser.password }); // no name
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.code).toBe("MISSING_FIELDS");
    }, 20000);
    (0, vitest_1.it)("rejects invalid email format with 400", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/register")
            .send({ ...validUser, email: "not-an-email" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.code).toBe("VALIDATION_ERROR");
    }, 20000);
    (0, vitest_1.it)("rejects password shorter than 10 chars", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/register")
            .send({ ...validUser, password: "short1" });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.code).toBe("PASSWORD_TOO_SHORT");
    }, 20000);
    (0, vitest_1.it)("rejects password longer than 20 chars", async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post("/auth/register")
            .send({ ...validUser, password: "a".repeat(21) });
        (0, vitest_1.expect)(res.status).toBe(400);
        (0, vitest_1.expect)(res.body.code).toBe("PASSWORD_TOO_LONG");
    }, 20000);
    (0, vitest_1.it)("rejects duplicate email with 409", async () => {
        await (0, supertest_1.default)(app_1.default).post("/auth/register").send(validUser);
        const res = await (0, supertest_1.default)(app_1.default).post("/auth/register").send(validUser);
        (0, vitest_1.expect)(res.status).toBe(409);
        (0, vitest_1.expect)(res.body.code).toBe("EMAIL_ALREADY_EXISTS");
    }, 20000);
});
