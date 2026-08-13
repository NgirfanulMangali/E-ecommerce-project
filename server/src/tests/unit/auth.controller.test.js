"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// controllers/authController.test.ts
const vitest_1 = require("vitest");
const auth_controller_1 = require("../../controllers/auth.controller");
const auth_service_1 = require("../../services/auth.service");
vitest_1.vi.mock('../../services/auth.service', () => ({
    registerUser: vitest_1.vi.fn(),
    checkEmailExists: vitest_1.vi.fn(),
}));
function mockResponse() {
    const res = {};
    res.status = vitest_1.vi.fn().mockReturnValue(res);
    res.json = vitest_1.vi.fn().mockReturnValue(res);
    return res;
}
function mockRequest(body) {
    return { body };
}
(0, vitest_1.beforeEach)(() => {
    vitest_1.vi.clearAllMocks();
});
(0, vitest_1.describe)('POST /register', () => {
    (0, vitest_1.it)('returns 400 when fields are missing', async () => {
        const req = mockRequest({ name: '', email: '', password: '' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'MISSING_FIELDS' }));
    });
    (0, vitest_1.it)('returns 400 for invalid email format', async () => {
        const req = mockRequest({ name: 'Alex', email: 'not-an-email', password: 'validpassword123' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'VALIDATION_ERROR' }));
    });
    (0, vitest_1.it)('returns 400 when password is shorter than 10 characters', async () => {
        const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'short1' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'PASSWORD_TOO_SHORT' }));
    });
    (0, vitest_1.it)('returns 400 when password is longer than 20 characters', async () => {
        const req = mockRequest({
            name: 'Alex',
            email: 'alex@example.com',
            password: 'a'.repeat(21),
        });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(400);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'PASSWORD_TOO_LONG' }));
    });
    (0, vitest_1.it)('returns 409 when email already exists', async () => {
        vitest_1.vi.mocked(auth_service_1.checkEmailExists).mockResolvedValue(true);
        const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(auth_service_1.checkEmailExists).toHaveBeenCalledWith('alex@example.com');
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(409);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'EMAIL_ALREADY_EXISTS' }));
    });
    (0, vitest_1.it)('returns 201 and strips the password on success', async () => {
        vitest_1.vi.mocked(auth_service_1.checkEmailExists).mockResolvedValue(false);
        vitest_1.vi.mocked(auth_service_1.registerUser).mockResolvedValue({
            id: '1',
            name: 'Alex',
            email: 'alex@example.com',
            password: 'hashed-password-should-not-appear',
        });
        const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(auth_service_1.registerUser).toHaveBeenCalledWith('Alex', 'alex@example.com', 'validpassword123');
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(201);
        const jsonArg = vitest_1.vi.mocked(res.json).mock.calls[0][0];
        (0, vitest_1.expect)(jsonArg.data).not.toHaveProperty('password');
        (0, vitest_1.expect)(jsonArg.data.email).toBe('alex@example.com');
    });
    (0, vitest_1.it)('returns 500 when the service throws', async () => {
        vitest_1.vi.mocked(auth_service_1.checkEmailExists).mockResolvedValue(false);
        vitest_1.vi.mocked(auth_service_1.registerUser).mockRejectedValue(new Error('DB connection failed'));
        const req = mockRequest({ name: 'Alex', email: 'alex@example.com', password: 'validpassword123' });
        const res = mockResponse();
        await (0, auth_controller_1.register)(req, res);
        (0, vitest_1.expect)(res.status).toHaveBeenCalledWith(500);
        (0, vitest_1.expect)(res.json).toHaveBeenCalledWith(vitest_1.expect.objectContaining({ code: 'INTERNAL_SERVER_ERROR' }));
    });
});
