import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "../../components/login-form" 

describe("LoginForm (integration)", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn())
    localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const fillAndSubmit = async (email: string, password: string) => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), email)
    await user.type(screen.getByLabelText(/password/i), password)
    await user.click(screen.getByRole("button", { name: /^login$/i }))

    return user
  }

  it("sends a POST request to the login endpoint with the correct payload", async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "abc123",
        data: { id: "1", email: "test@example.com" },
      }),
    })

    await fillAndSubmit("test@example.com", "secret123")

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/auth/login",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "test@example.com",
            password: "secret123",
          }),
        })
      )
    })
  })

  it("persists token and user to localStorage after a successful login", async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        token: "abc123",
        data: { id: "1", email: "test@example.com" },
      }),
    })

    await fillAndSubmit("test@example.com", "secret123")

    await waitFor(() => {
      expect(localStorage.getItem("token")).toBe("abc123")
      expect(localStorage.getItem("user")).toBe(
        JSON.stringify({ id: "1", email: "test@example.com" })
      )
    })
    expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument()
  })

  it("shows the server-provided error message on a failed login (4xx/5xx)", async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => ({ message: "Invalid email or password" }),
    })

    await fillAndSubmit("test@example.com", "wrongpass")

    expect(
      await screen.findByText("Invalid email or password")
    ).toBeInTheDocument()
    expect(localStorage.getItem("token")).toBeNull()
  })

  it("falls back to a status-based message when the error body isn't valid JSON", async () => {
    ;(fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("Unexpected token < in JSON")
      },
    })

    await fillAndSubmit("test@example.com", "secret123")

    expect(await screen.findByText("Request failed: 500")).toBeInTheDocument()
  })

  it("shows an error when the network request itself fails", async () => {
    ;(fetch as any).mockRejectedValueOnce(new TypeError("Failed to fetch"))

    await fillAndSubmit("test@example.com", "secret123")

    expect(await screen.findByText("Failed to fetch")).toBeInTheDocument()
  })

  it("shows a loading state while the request is in flight, then resolves", async () => {
    let resolveFetch: (value: any) => void
    ;(fetch as any).mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFetch = resolve
      })
    )

    await fillAndSubmit("test@example.com", "secret123")

    expect(
      await screen.findByRole("button", { name: /logging in/i })
    ).toBeDisabled()

    resolveFetch!({
      ok: true,
      json: async () => ({ token: "t", data: {} }),
    })

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^login$/i })
      ).not.toBeDisabled()
    })
  })

  it("does not call fetch when required fields are left empty", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /^login$/i }))

    expect(fetch).not.toHaveBeenCalled()
  })
})