import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "../../components/Signup";

const validUser = {
  name: "Jane Doe",
  email: "jane@example.com",
  password: "password123",
};

async function fillSignupForm(
  user: ReturnType<typeof userEvent.setup>,
  overrides: Partial<typeof validUser & { confirmPassword: string }> = {},
) {
  const data = {
    ...validUser,
    confirmPassword: validUser.password,
    ...overrides,
  };

  await user.type(screen.getByLabelText(/full name/i), data.name);
  await user.type(screen.getByLabelText(/^email$/i), data.email);
  await user.type(screen.getByLabelText(/^password$/i), data.password);
  await user.type(
    screen.getByLabelText(/confirm password/i),
    data.confirmPassword,
  );
}

function mockFetchResponse(
  body: unknown,
  init: { ok: boolean; status: number },
) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: init.ok,
      status: init.status,
      json: async () => body,
    }),
  );
}

describe("SignupForm integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("submits registration data to the auth API", async () => {
    const user = userEvent.setup();
    mockFetchResponse(
      {
        message: "Registration successful",
        data: {
          id: "user-1",
          name: validUser.name,
          email: validUser.email,
        },
      },
      { ok: true, status: 201 },
    );

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:5000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: validUser.name,
          email: validUser.email,
          password: validUser.password,
        }),
      });
    });

    expect(screen.queryByText(/passwords do not match/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^create account$/i }),
    ).toBeEnabled();
  });

  it("shows the API error message when registration fails", async () => {
    const user = userEvent.setup();
    mockFetchResponse(
      {
        message: "Email already registered. use a different email or login",
        code: "EMAIL_ALREADY_EXISTS",
      },
      { ok: false, status: 409 },
    );

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(
      await screen.findByText(
        /email already registered\. use a different email or login/i,
      ),
    ).toBeInTheDocument();
  });

  it("shows a fallback error when the API response has no message", async () => {
    const user = userEvent.setup();
    mockFetchResponse(null, { ok: false, status: 500 });

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(
      await screen.findByText(/request failed: 500/i),
    ).toBeInTheDocument();
  });
});
