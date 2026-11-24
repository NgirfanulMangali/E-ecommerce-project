import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import { Checkout } from "../../components/Checkout";
import { cartService } from "../../services/cart.service";
import type { Cart, CartProduct } from "../../types/cart";

vi.mock("../../services/cart.service", () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
  },
}));

const getCartMock = vi.mocked(cartService.getCart);

const productType = "clothing" as CartProduct["type"];

const filledCart: Cart = {
  id: "cart-1",
  userId: "user-1",
  totalItems: 3,
  totalPrice: 245.5,
  items: [
    {
      productId: "p1",
      quantity: 2,
      lineTotal: 200,
      product: {
        id: "p1",
        name: "Slim Jeans",
        price: 100,
        imageUrl: "/images/jeans.webp",
        type: productType,
      },
    },
    {
      productId: "p2",
      quantity: 1,
      lineTotal: 45.5,
      product: {
        id: "p2",
        name: "Basic Tee",
        price: 45.5,
        imageUrl: "/images/tee.webp",
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

function renderCheckout() {
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/cart" element={<div>Cart Page</div>} />
        <Route path="/products" element={<div>Products Page</div>} />
        <Route path="/orderplaced" element={<div>Order Placed Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Checkout", () => {
  beforeEach(() => {
    getCartMock.mockReset();
  });

  describe("loading state", () => {
    it("menampilkan teks loading selagi keranjang dimuat", () => {
      getCartMock.mockReturnValue(new Promise(() => {}));

      renderCheckout();

      expect(screen.getByText("Loading your order...")).toBeInTheDocument();
    });
  });

  describe("error state", () => {
    it("menampilkan pesan error dari service dan link kembali ke cart", async () => {
      getCartMock.mockRejectedValue(new Error("Unauthorized"));

      renderCheckout();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Unauthorized",
      );
      expect(
        screen.getByRole("link", { name: "Back to cart" }),
      ).toHaveAttribute("href", "/cart");
    });

    it("memakai pesan fallback jika error bukan instance Error", async () => {
      getCartMock.mockRejectedValue("boom");

      renderCheckout();

      expect(await screen.findByRole("alert")).toHaveTextContent(
        "Failed to load your cart.",
      );
    });
  });

  describe("empty state", () => {
    it("menampilkan pesan keranjang kosong dan link ke produk", async () => {
      getCartMock.mockResolvedValue(emptyCart);

      renderCheckout();

      expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Continue Shopping" }),
      ).toHaveAttribute("href", "/products");
      expect(screen.queryByText("Checkout")).not.toBeInTheDocument();
    });
  });

  describe("dengan item di keranjang", () => {
    beforeEach(() => {
      getCartMock.mockResolvedValue(filledCart);
    });

    it("memanggil cartService.getCart sekali saat mount", async () => {
      renderCheckout();

      await screen.findByRole("heading", { name: "Checkout" });
      expect(getCartMock).toHaveBeenCalledTimes(1);
    });

    it("menampilkan alamat pengiriman default", async () => {
      renderCheckout();

      await screen.findByRole("heading", { name: "Checkout" });

      expect(screen.getByText("Shipping Address")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText(/123 Main Street/)).toBeInTheDocument();
      expect(screen.getByText("+1 234 567 8901")).toBeInTheDocument();
    });

    it("menampilkan metode pembayaran default", async () => {
      renderCheckout();

      await screen.findByRole("heading", { name: "Checkout" });

      expect(screen.getByText("Payment Method")).toBeInTheDocument();
      expect(screen.getByText("Visa")).toBeInTheDocument();
      expect(screen.getByText(/4242/)).toBeInTheDocument();
      // Badge "Default" muncul di alamat dan pembayaran
      expect(screen.getAllByText("Default")).toHaveLength(2);
    });

    it("menampilkan jumlah item pada judul section", async () => {
      renderCheckout();

      expect(
        await screen.findByText("Order Items (3)"),
      ).toBeInTheDocument();
    });

    it("merender setiap item beserta gambar, harga satuan, subtotal, dan qty", async () => {
      renderCheckout();

      const list = await screen.findByRole("list");
      const rows = within(list).getAllByRole("listitem");
      expect(rows).toHaveLength(2);

      const first = within(rows[0]);
      expect(first.getByText("Slim Jeans")).toBeInTheDocument();
      expect(first.getByText("$100.00 each")).toBeInTheDocument();
      expect(first.getByText("$200.00")).toBeInTheDocument();
      expect(first.getByText("x2")).toBeInTheDocument();
      expect(first.getByRole("img", { name: "Slim Jeans" })).toHaveAttribute(
        "src",
        "/images/jeans.webp",
      );

      const second = within(rows[1]);
      expect(second.getByText("Basic Tee")).toBeInTheDocument();
      expect(second.getByText("$45.50 each")).toBeInTheDocument();
      expect(second.getByText("$45.50")).toBeInTheDocument();
      expect(second.getByText("x1")).toBeInTheDocument();
    });

    it("menghitung subtotal, ongkir, dan total dengan benar", async () => {
      renderCheckout();

      await screen.findByRole("heading", { name: "Checkout" });

      expect(screen.getByText("Subtotal").nextElementSibling).toHaveTextContent(
        "$245.50",
      );
      expect(screen.getByText("Shipping").nextElementSibling).toHaveTextContent(
        "$10.00",
      );
      expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
        "$255.50",
      );
    });

    it("tombol kembali menavigasi ke /cart", async () => {
      const user = userEvent.setup();
      renderCheckout();

      await user.click(await screen.findByRole("button", { name: "Go back" }));

      expect(screen.getByText("Cart Page")).toBeInTheDocument();
    });

    it("tombol Place Order menavigasi ke /orderplaced", async () => {
      const user = userEvent.setup();
      renderCheckout();

      await user.click(
        await screen.findByRole("button", { name: "Place Order" }),
      );

      expect(
        await screen.findByText("Order Placed Page"),
      ).toBeInTheDocument();
    });
  });
});