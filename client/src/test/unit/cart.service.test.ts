import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { cartService } from "../../services/cart.service";
import type { Cart } from "../../types/cart";

const mockCart: Cart = {
  id: "cart-1",
  userId: "user-1",
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function mockResponse(body: unknown, status = 200) {
  vi.mocked(fetch).mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response);
}

describe("cartService", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("getCart", () => {
    it("requests /cart and returns the cart data", async () => {
      mockResponse({ data: mockCart });

      const result = await cartService.getCart();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/cart$/),
        expect.objectContaining({
          headers: expect.objectContaining({
            "Content-Type": "application/json",
          }),
        })
      );
      expect(result).toEqual(mockCart);
    });

    it("sends the Authorization header when a token exists", async () => {
      localStorage.setItem("token", "abc123");
      mockResponse({ data: mockCart });

      await cartService.getCart();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer abc123",
          }),
        })
      );
    });

    it("omits the Authorization header when there is no token", async () => {
      mockResponse({ data: mockCart });

      await cartService.getCart();

      const options = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
      expect(options.headers).not.toHaveProperty("Authorization");
    });

    it("throws the backend message when the response is not ok", async () => {
      mockResponse({ message: "Unauthorized" }, 401);

      await expect(cartService.getCart()).rejects.toThrow("Unauthorized");
    });

    it("throws a fallback message when the backend sends no message", async () => {
      mockResponse({}, 500);

      await expect(cartService.getCart()).rejects.toThrow("Request failed: 500");
    });

    it("falls back to 'Request failed: <status>' when the body is not valid JSON", async () => {
        vi.mocked(fetch).mockResolvedValue({
          ok: false,
          status: 502,
          json: async () => {
            throw new SyntaxError("Unexpected token '<'");
          },
        } as unknown as Response);
      
        await expect(cartService.getCart()).rejects.toThrow("Request failed: 502");
      });
  });

  describe("addItem", () => {
    it("POSTs productId and quantity as JSON and returns the cart", async () => {
      localStorage.setItem("token", "abc123");
      mockResponse({ data: mockCart });

      const result = await cartService.addItem("prod-1", 2);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/cart$/),
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({ productId: "prod-1", quantity: 2 }),
          headers: expect.objectContaining({
            Authorization: "Bearer abc123",
          }),
        })
      );
      expect(result).toEqual(mockCart);
    });

    it("throws the backend message on failure", async () => {
      mockResponse({ message: "Product out of stock" }, 400);

      await expect(cartService.addItem("prod-1", 99)).rejects.toThrow(
        "Product out of stock"
      );
    });
  });
});