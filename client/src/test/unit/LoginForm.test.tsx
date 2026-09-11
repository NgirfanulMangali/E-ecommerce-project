import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "../../components/login-form" 
import { loginUser } from "../../services/auth.service" 

vi.mock("../../services/auth.service", () => ({
  loginUser: vi.fn(),
}))

const mockedLoginUser = vi.mocked(loginUser)

describe("LoginForm", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it("renders email, password fields and submit button", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /^login$/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole("button", { name: /login with google/i })
    ).toBeInTheDocument()
  })

  it("updates input values as the user types", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const passwordInput = screen.getByLabelText(
      /password/i
    ) as HTMLInputElement

    await user.type(emailInput, "test@example.com")
    await user.type(passwordInput, "secret123")

    expect(emailInput.value).toBe("test@example.com")
    expect(passwordInput.value).toBe("secret123")
  })

  it("calls loginUser with form data on submit", async () => {
    const user = userEvent.setup()
    mockedLoginUser.mockResolvedValueOnce({
      token: "fake-token",
      data: { id: "1", email: "test@example.com" },
    } as any)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(mockedLoginUser).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "secret123",
      })
    })
  })

  it("shows loading state and disables the submit button while submitting", async () => {
    const user = userEvent.setup()
    let resolvePromise: (value: any) => void
    mockedLoginUser.mockReturnValueOnce(
      new Promise((resolve) => {
        resolvePromise = resolve
      })
    )

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(
      await screen.findByRole("button", { name: /logging in/i })
    ).toBeDisabled()

    resolvePromise!({ token: "t", data: {} })

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^login$/i })
      ).not.toBeDisabled()
    })
  })

  it("stores token and user data in localStorage on successful login", async () => {
    const user = userEvent.setup()
    const setItemSpy = vi.spyOn(Storage.prototype, "setItem")

    mockedLoginUser.mockResolvedValueOnce({
      token: "abc123",
      data: { id: "1", email: "test@example.com" },
    } as any)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "secret123")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(setItemSpy).toHaveBeenCalledWith("token", "abc123")
      expect(setItemSpy).toHaveBeenCalledWith(
        "user",
        JSON.stringify({ id: "1", email: "test@example.com" })
      )
    })
  })

  it("displays an error message when loginUser throws an Error", async () => {
    const user = userEvent.setup()
    mockedLoginUser.mockRejectedValueOnce(new Error("Invalid credentials"))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument()
  })

  it("displays a generic error message when a non-Error is thrown", async () => {
    const user = userEvent.setup()
    mockedLoginUser.mockRejectedValueOnce("some string failure")

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(
      await screen.findByText("Something went wrong")
    ).toBeInTheDocument()
  })

  it("clears previous error on a new submit attempt", async () => {
    const user = userEvent.setup()
    mockedLoginUser
      .mockRejectedValueOnce(new Error("Invalid credentials"))
      .mockResolvedValueOnce({ token: "t", data: {} } as any)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpass")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument()

    await user.clear(screen.getByLabelText(/password/i))
    await user.type(screen.getByLabelText(/password/i), "correctpass")
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    await waitFor(() => {
      expect(
        screen.queryByText("Invalid credentials")
      ).not.toBeInTheDocument()
    })
  })

  it("does not submit the form when the Google login button is clicked", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /login with google/i }))

    expect(mockedLoginUser).not.toHaveBeenCalled()
  })
})