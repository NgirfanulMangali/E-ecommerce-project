import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import CartPage from "../../components/Cartpage";
import { cartService } from "../../services/cart.service";
import type { Cart, CartProduct } from "../../types/cart";

vi.mock("../../services/cart.service", () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
  },
}));

const productType = "NEW_ARRIVAL" as CartProduct["type"];

const mockCart: Cart = {
  id: "cart-1",
  userId: "user-1",
  totalItems: 3,
  totalPrice: 60,
  items: [
    {
      productId: "prod-1",
      quantity: 2,
      lineTotal: 50,
      product: {
        id: "prod-1",
        name: "Wireless Mouse",
        price: 25,
        imageUrl: "https://example.com/mouse.jpg",
        type: productType,
      },
    },
    {
      productId: "prod-2",
      quantity: 1,
      lineTotal: 10,
      product: {
        id: "prod-2",
        name: "Mouse Pad",
        price: 10,
        imageUrl: "https://example.com/pad.jpg",
        type: productType,
      },
    },
  ],
};

const emptyCart: Cart = {
  id: null,
  userId: "user-1",
  items: [],
  totalItems: 0,
  totalPrice: 0,
};

function renderPage() {
  return render(
    <MemoryRouter>
      <CartPage />
    </MemoryRouter>
  );
}

describe("CartPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("loading state", () => {
    it("shows a loading message while the cart is being fetched", () => {
      vi.mocked(cartService.getCart).mockReturnValue(new Promise(() => {}));

      renderPage();

      expect(screen.getByText("Loading your cart...")).toBeInTheDocument();
      expect(
        screen.queryByRole("heading", { name: /your cart/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("shows the error message in an alert when the request fails", async () => {
      vi.mocked(cartService.getCart).mockRejectedValue(new Error("Unauthorized"));

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
      expect(
        screen.getByText(/please check your login session/i)
      ).toBeInTheDocument();
      expect(screen.getByRole("heading", { name: /your cart/i })).toBeInTheDocument();
    });

    it("shows a fallback message when a non-Error value is thrown", async () => {
      vi.mocked(cartService.getCart).mockRejectedValue("boom");

      renderPage();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Failed to load your cart."
      );
    });

    it("does not render the checkout link on error", async () => {
      vi.mocked(cartService.getCart).mockRejectedValue(new Error("fail"));

      renderPage();

      await screen.findByRole("alert");
      expect(
        screen.queryByRole("link", { name: /go to checkout/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("empty cart", () => {
    it("shows the empty state with a Continue Shopping link", async () => {
      vi.mocked(cartService.getCart).mockResolvedValue(emptyCart);

      renderPage();

      expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByText("Add something to see your order summary.")
      ).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: /continue shopping/i })
      ).toHaveAttribute("href", "/products");
    });

    it("hides the order summary and checkout bar", async () => {
      vi.mocked(cartService.getCart).mockResolvedValue(emptyCart);

      renderPage();

      await screen.findByText("Your cart is empty");
      expect(
        screen.queryByRole("heading", { name: /order summary/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("link", { name: /go to checkout/i })
      ).not.toBeInTheDocument();
    });

    it("treats a null cart as empty", async () => {
      vi.mocked(cartService.getCart).mockResolvedValue(null as unknown as Cart);

      renderPage();

      expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    });
  });

  describe("cart with items", () => {
    beforeEach(() => {
      vi.mocked(cartService.getCart).mockResolvedValue(mockCart);
    });

    it("calls cartService.getCart once on mount", async () => {
      renderPage();

      await screen.findByText("Wireless Mouse");
      expect(cartService.getCart).toHaveBeenCalledTimes(1);
    });

    it("renders every item with name, quantity, line total and unit price", async () => {
      renderPage();

      expect(await screen.findByText("Wireless Mouse")).toBeInTheDocument();
      expect(screen.getByText("Mouse Pad")).toBeInTheDocument();

      expect(screen.getAllByRole("listitem")).toHaveLength(2);

      expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
      expect(screen.getByText("Quantity: 1")).toBeInTheDocument();

      expect(screen.getByText("$50.00")).toBeInTheDocument();
      expect(screen.getByText("$25.00 each")).toBeInTheDocument();
      expect(screen.getByText("$10.00")).toBeInTheDocument();
      expect(screen.getByText("$10.00 each")).toBeInTheDocument();
    });

    it("renders product images with alt text and src", async () => {
      renderPage();

      const img = await screen.findByRole("img", { name: "Wireless Mouse" });
      expect(img).toHaveAttribute("src", "https://example.com/mouse.jpg");
      expect(screen.getByRole("img", { name: "Mouse Pad" })).toHaveAttribute(
        "src",
        "https://example.com/pad.jpg"
      );
    });

    it("renders the order summary with total items and subtotal", async () => {
      renderPage();

      const summary = await screen.findByRole("region", { name: /order summary/i });

      expect(within(summary).getByText("Total items")).toBeInTheDocument();
      expect(within(summary).getByText("3")).toBeInTheDocument();
      expect(within(summary).getByText("Subtotal")).toBeInTheDocument();
      expect(within(summary).getByText("$60.00")).toBeInTheDocument();
    });

    it("renders the checkout link pointing to /checkout", async () => {
      renderPage();

      expect(
        await screen.findByRole("link", { name: /go to checkout/i })
      ).toHaveAttribute("href", "/checkout");
    });

    it("does not show the empty state", async () => {
      renderPage();

      await screen.findByText("Wireless Mouse");
      expect(screen.queryByText("Your cart is empty")).not.toBeInTheDocument();
    });
  });

  describe("layout", () => {
    it("renders the breadcrumb with a Home link and the current page", async () => {
      vi.mocked(cartService.getCart).mockResolvedValue(mockCart);

      renderPage();

      const nav = await screen.findByRole("navigation", { name: /breadcrumb/i });
      expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute(
        "href",
        "/"
      );
      expect(within(nav).getByText("Cart")).toBeInTheDocument();
    });
  });
});