import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { http, HttpResponse } from "msw";
import CartPage from "../../components/Cartpage";
import { server } from "../../test/msw/server";
import { mockCart } from "../../test/msw/handlers";

const API_BASE_URL = "http://localhost:5000";

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );
}

describe("CartPage (integration, real service via MSW)", () => {
  describe("authenticated user", () => {
    beforeEach(() => {
      localStorage.setItem("token", "valid-token");
    });

    it("shows loading first, then renders the cart from the API", async () => {
      renderPage();

      expect(screen.getByText("Loading your cart...")).toBeInTheDocument();

      expect(await screen.findByText("Wireless Mouse")).toBeInTheDocument();
      expect(screen.getByText("Mouse Pad")).toBeInTheDocument();
      expect(screen.queryByText("Loading your cart...")).not.toBeInTheDocument();
    });

    it("renders quantities, line totals and unit prices from the response", async () => {
      renderPage();

      await screen.findByText("Wireless Mouse");

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
      expect(screen.getByText("$50.00")).toBeInTheDocument();
      expect(screen.getByText("$25.00 each")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();
      expect(screen.getByText("$10.00 each")).toBeInTheDocument();
    });

    it("renders the order summary and checkout link", async () => {
      renderPage();

      const summary = await screen.findByRole("region", { name: /order summary/i });

      expect(within(summary).getByText("3")).toBeInTheDocument();
      expect(within(summary).getByText("$60.00")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /go to checkout/i })
      ).toHaveAttribute("href", "/checkout");
    });

    it("sends the Bearer token and JSON content type to the API", async () => {
      let captured: Headers | undefined;

      server.use(
        http.get(`${API_BASE_URL}/cart`, ({ request }) => {
          captured = request.headers;
          return HttpResponse.json({ data: mockCart });
        })
      );

      renderPage();
      await screen.findByText("Wireless Mouse");

      expect(captured?.get("authorization")).toBe("Bearer valid-token");
      expect(captured?.get("content-type")).toBe("application/json");
    });

    it("shows the empty state when the API returns an empty cart", async () => {
      server.use(
        http.get(`${API_BASE_URL}/cart`, () =>
          HttpResponse.json({
            data: { id: null, userId: "user-1", items: [], totalItems: 0, totalPrice: 0 },
          })
        )
      );

      renderPage();

      expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /continue shopping/i })
      ).toHaveAttribute("href", "/products");
      expect(
        screen.queryByRole("link", { name: /go to checkout/i })
      ).not.toBeInTheDocument();
    });

    it("shows the backend message on a 500 response", async () => {
      server.use(
        http.get(`${API_BASE_URL}/cart`, () =>
          HttpResponse.json({ message: "Database unavailable" }, { status: 500 })
        )
      );

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Database unavailable");
    });

    it("falls back to 'Request failed: <status>' when the error body has no message", async () => {
      server.use(
        http.get(`${API_BASE_URL}/cart`, () =>
          HttpResponse.json({}, { status: 503 })
        )
      );

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Request failed: 503");
    });

    it("shows an error when the network request fails", async () => {
      server.use(http.get(`${API_BASE_URL}/cart`, () => HttpResponse.error()));

      renderPage();

      // fetch rejects with a TypeError (an Error instance), so the component
      // shows that message rather than the "Failed to load your cart." fallback
      expect(await screen.findByRole("alert")).toHaveTextContent(/fail/i);
    });
  });

  describe("unauthenticated user", () => {
    it("shows 'Unauthorized' and the login hint when there is no token", async () => {
      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
      expect(
        screen.getByText(/please check your login session/i)
      ).toBeInTheDocument();
    });

    it("shows 'Unauthorized' when the token is invalid", async () => {
      localStorage.setItem("token", "expired-token");

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
    });
  });

  describe("non-JSON error responses", () => {
    // Fails until requestCart gets `.json().catch(() => ({}))`.
    // Today the user would see a SyntaxError message instead.
    it("shows 'Request failed: 502' when a proxy returns an HTML error page", async () => {
      localStorage.setItem("token", "valid-token");
      server.use(
        http.get(`${API_BASE_URL}/cart`, () =>
          new HttpResponse("<html>Bad Gateway</html>", {
            status: 502,
            headers: { "Content-Type": "text/html" },
          })
        )
      );

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Request failed: 502");
    });
  });
});