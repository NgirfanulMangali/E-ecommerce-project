import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignupForm from "../../components/Signup";
import { registerUser } from "../../services/auth.service";

vi.mock("../../services/auth.service", () => ({
  registerUser: vi.fn(),
}));

const mockedRegisterUser = vi.mocked(registerUser);

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

describe("SignupForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders registration fields and submit button", () => {
    render(<SignupForm />);

    expect(
      screen.getByText("Create your account", { exact: true }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^create account$/i }),
    ).toBeInTheDocument();
  });

  it("shows an error when passwords do not match", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillSignupForm(user, { confirmPassword: "different123" });
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("shows an error when password is shorter than 10 characters", async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await fillSignupForm(user, {
      password: "short1",
      confirmPassword: "short1",
    });
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(
      screen.getByText(/password must be at least 10 characters long/i),
    ).toBeInTheDocument();
    expect(mockedRegisterUser).not.toHaveBeenCalled();
  });

  it("registers a user with the form payload", async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockResolvedValue({
      id: "1",
      name: validUser.name,
      email: validUser.email,
      token: "fake-token",
    });

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    await waitFor(() => {
      expect(mockedRegisterUser).toHaveBeenCalledWith({
        name: validUser.name,
        email: validUser.email,
        password: validUser.password,
      });
    });
  });

  it("shows the API error message when registration fails", async () => {
    const user = userEvent.setup();
    mockedRegisterUser.mockRejectedValue(new Error("Email already exists"));

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(
      await screen.findByText(/email already exists/i),
    ).toBeInTheDocument();
  });

  it("disables the submit button while registration is in progress", async () => {
    const user = userEvent.setup();
    let resolveRegister!: (value: {
      id: string;
      name: string;
      email: string;
      token: string;
    }) => void;

    mockedRegisterUser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRegister = resolve;
        }),
    );

    render(<SignupForm />);

    await fillSignupForm(user);
    await user.click(screen.getByRole("button", { name: /^create account$/i }));

    expect(
      screen.getByRole("button", { name: /creating account/i }),
    ).toBeDisabled();

    resolveRegister({
      id: "1",
      name: validUser.name,
      email: validUser.email,
      token: "fake-token",
    });

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^create account$/i }),
      ).toBeEnabled();
    });
  });
});
