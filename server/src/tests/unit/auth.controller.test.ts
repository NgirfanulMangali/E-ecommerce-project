// controllers/authController.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { register } from '../../controllers/auth.controller';
import { registerUser, checkEmailExists } from '../../services/auth.service';

vi.mock('../../services/auth.service', () => ({
  registerUser: vi.fn(),
  checkEmailExists: vi.fn(),
}));

function mockResponse() {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

function mockRequest(body: any) {
  return { body } as any;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('POST /register', () => {

  it('returns 400 when fields are missing', async () => {
    const req = mockRequest({ name: '', email: '', password: '' });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'MISSING_FIELDS' })
    );
  });

  it('returns 400 for invalid email format', async () => {
    const req = mockRequest({ name: 'Alex', email: 'not-an-email', password: 'validpassword123' });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'VALIDATION_ERROR' })
    );
  });

  it('returns 400 when password is shorter than 10 characters', async () => {
    const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'short1' });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PASSWORD_TOO_SHORT' })
    );
  });

  it('returns 400 when password is longer than 20 characters', async () => {
    const req = mockRequest({
      name: 'Alex',
      email: 'alex@example.com',
      password: 'a'.repeat(21),
    });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'PASSWORD_TOO_LONG' })
    );
  });

  it('returns 409 when email already exists', async () => {
    vi.mocked(checkEmailExists).mockResolvedValue(true);

    const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
    const res = mockResponse();

    await register(req, res);

    expect(checkEmailExists).toHaveBeenCalledWith('alex@example.com');
    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'EMAIL_ALREADY_EXISTS' })
    );
  });

  it('returns 201 and strips the password on success', async () => {
    vi.mocked(checkEmailExists).mockResolvedValue(false);
    vi.mocked(registerUser).mockResolvedValue({
      id: '1',
      name: 'Alex',
      email: 'alex@example.com',
      password: 'hashed-password-should-not-appear',
    } as any);

    const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
    const res = mockResponse();

    await register(req, res);

    expect(registerUser).toHaveBeenCalledWith('Alex', 'alex@example.com', 'validpassword123');
    expect(res.status).toHaveBeenCalledWith(201);

    const jsonArg = vi.mocked(res.json).mock.calls[0][0];
    expect(jsonArg.data).not.toHaveProperty('password');
    expect(jsonArg.data.email).toBe('alex@example.com');
  });

  it('returns 500 when the service throws', async () => {
    vi.mocked(checkEmailExists).mockResolvedValue(false);
    vi.mocked(registerUser).mockRejectedValue(new Error('DB connection failed'));

    const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
    const res = mockResponse();

    await register(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' })
    );
  });

});