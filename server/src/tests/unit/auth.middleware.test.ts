import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { requireAuth } from "../../middleware/auth.middleware.js";

vi.mock("jsonwebtoken", () => ({
  default: {
    verify: vi.fn(),
  },
}));

function mockResponse() {
  const res = {
    status: vi.fn(),
    json: vi.fn(),
  } as unknown as Response;

  vi.mocked(res.status).mockReturnValue(res);
  vi.mocked(res.json).mockReturnValue(res);

  return res;
}

describe("requireAuth", () => {
  let next: NextFunction;

  beforeEach(() => {
    vi.clearAllMocks();
    next = vi.fn();
  });

  it("returns 401 when Authorization header is missing", () => {
    const req = { headers: {} } as Request;
    const res = mockResponse();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Authentication required",
      code: "UNAUTHENTICATED",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 401 when token is invalid", () => {
    vi.mocked(jwt.verify).mockImplementation(() => {
      throw new Error("invalid token");
    });

    const req = {
      headers: { authorization: "Bearer bad-token" },
    } as Request;
    const res = mockResponse();

    requireAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: "Invalid or expired token",
      code: "INVALID_TOKEN",
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("attaches the user and calls next when the token is valid", () => {
    vi.mocked(jwt.verify).mockReturnValue({
      id: "user-1",
      email: "alex@example.com",
    } as never);

    const req = {
      headers: { authorization: "Bearer valid-token" },
    } as Request;
    const res = mockResponse();

    requireAuth(req, res, next);

    expect(jwt.verify).toHaveBeenCalledWith(
      "valid-token",
      process.env.JWT_SECRET
    );
    expect(req.user).toEqual({
      id: "user-1",
      email: "alex@example.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
