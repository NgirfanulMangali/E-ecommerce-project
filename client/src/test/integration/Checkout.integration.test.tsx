import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import { Checkout } from "../../components/Checkout";
import type { Cart, CartProduct } from "../../types/cart";

// Integrasi: Checkout + cartService asli. Yang di-mock hanya fetch (batas jaringan).

const productType = "clothing" as CartProduct["type"];

const cart: Cart = {
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

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function renderApp() {
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

describe("Checkout (integration)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("alur sukses: loading -> data dari API tampil -> total benar", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ data: cart }));

    renderApp();

    expect(screen.getByText("Loading your order...")).toBeInTheDocument();

    expect(await screen.findByText("Order Items (3)")).toBeInTheDocument();

    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows).toHaveLength(2);
    expect(within(rows[0]).getByText("Slim Jeans")).toBeInTheDocument();
    expect(within(rows[1]).getByText("Basic Tee")).toBeInTheDocument();

    expect(screen.getByText("Subtotal").nextElementSibling).toHaveTextContent(
      "$245.50",
    );
    expect(screen.getByText("Total").nextElementSibling).toHaveTextContent(
      "$255.50",
    );
  });

  it("mengirim request GET /cart dengan token dari localStorage", async () => {
    localStorage.setItem("token", "jwt-token");
    fetchMock.mockResolvedValue(jsonResponse({ data: cart }));

    renderApp();
    await screen.findByText("Order Items (3)");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toMatch(/\/cart$/);
    expect(init.headers).toMatchObject({
      Authorization: "Bearer jwt-token",
    });
  });

  it("keranjang kosong dari API menampilkan empty state", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({
        data: { id: null, userId: "user-1", items: [], totalItems: 0, totalPrice: 0 },
      }),
    );

    renderApp();

    expect(await screen.findByText("Your cart is empty")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Continue Shopping" }),
    ).toBeInTheDocument();
  });

  it("response 401 menampilkan pesan error dari server", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));

    renderApp();

    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
    expect(
      screen.getByRole("link", { name: "Back to cart" }),
    ).toHaveAttribute("href", "/cart");
  });

  it("response 500 tanpa JSON menampilkan pesan fallback status", async () => {
    fetchMock.mockResolvedValue(new Response("oops", { status: 500 }));

    renderApp();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Request failed: 500",
    );
  });

  it("error jaringan menampilkan pesan error", async () => {
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

    renderApp();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to fetch",
    );
  });

  it("klik 'Back to cart' pada state error berpindah ke halaman cart", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));

    renderApp();
    await user.click(await screen.findByRole("link", { name: "Back to cart" }));

    expect(screen.getByText("Cart Page")).toBeInTheDocument();
  });

  it("alur lengkap: muat cart lalu Place Order menuju /orderplaced", async () => {
    const user = userEvent.setup();
    fetchMock.mockResolvedValue(jsonResponse({ data: cart }));

    renderApp();
    await user.click(
      await screen.findByRole("button", { name: "Place Order" }),
    );

    expect(await screen.findByText("Order Placed Page")).toBeInTheDocument();
  });
});