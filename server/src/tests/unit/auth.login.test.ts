import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { login } from '../../controllers/auth.controller';
import { prisma } from '../../lib/prisma';

vi.mock('../../lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('bcryptjs', () => ({
  default: {
    compare: vi.fn(),
  },
}));

vi.mock('jsonwebtoken', () => ({
  default: {
    sign: vi.fn(),
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

function mockRequest(body: unknown) {
  return { body } as Request;
}

const existingUser = {
  id: 'user-1',
  name: 'Alex',
  email: 'alex@example.com',
  password: 'hashed-password',
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /login', () => {
  it('returns 400 when email or password is missing', async () => {
    const req = mockRequest({ email: '', password: '' });
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email dan password harus diisi',
    });
    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('returns 401 when user is not found', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    const req = mockRequest({ email: 'unknown@example.com', password: 'password123' });
    const res = mockResponse();

    await login(req, res);

    expect(prisma.user.findUnique).toHaveBeenCalledWith({
      where: { email: 'unknown@example.com' },
    });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email atau password salah',
    });
  });

  it('returns 401 when password is invalid', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const req = mockRequest({ email: 'alex@example.com', password: 'wrong-password' });
    const res = mockResponse();

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('wrong-password', existingUser.password);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Email atau password salah',
    });
    expect(jwt.sign).not.toHaveBeenCalled();
  });

  it('returns 200 with token and user data on success', async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(existingUser);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
    vi.mocked(jwt.sign).mockReturnValue('signed-jwt-token' as never);

    const req = mockRequest({ email: 'alex@example.com', password: 'password123' });
    const res = mockResponse();

    await login(req, res);

    expect(bcrypt.compare).toHaveBeenCalledWith('password123', existingUser.password);
    expect(jwt.sign).toHaveBeenCalledWith(
      { id: existingUser.id, email: existingUser.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' },
    );
    expect(res.status).toHaveBeenCalledWith(200);

    const jsonArg = vi.mocked(res.json).mock.calls[0][0];
    expect(jsonArg).toEqual({
      message: 'Login berhasil',
      token: 'signed-jwt-token',
      data: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    });
    expect(jsonArg.data).not.toHaveProperty('password');
  });

  it('returns 500 when prisma throws', async () => {
    vi.mocked(prisma.user.findUnique).mockRejectedValue(new Error('DB connection failed'));

    const req = mockRequest({ email: 'alex@example.com', password: 'password123' });
    const res = mockResponse();

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Terjadi kesalahan pada server. Silakan coba lagi nanti',
    });
  });
});
