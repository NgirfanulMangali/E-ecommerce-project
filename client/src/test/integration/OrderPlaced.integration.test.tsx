import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router";

import Checkout from "../../components/Checkout";
import OrderPlaced from "../../components/Orderplaced";
import type { Cart, CartProduct } from "../../types/cart";

// Integrasi: Checkout (+ cartService asli) -> navigasi -> OrderPlaced.
// Yang di-mock hanya fetch.

const cart: Cart = {
  id: "cart-1",
  userId: "user-1",
  totalItems: 1,
  totalPrice: 100,
  items: [
    {
      productId: "p1",
      quantity: 1,
      lineTotal: 100,
      product: {
        id: "p1",
        name: "Slim Jeans",
        price: 100,
        imageUrl: "/images/jeans.webp",
        type: "clothing" as CartProduct["type"],
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

function renderFlow(
  handlers: { onTrackOrder?: () => void; onContinueShopping?: () => void } = {},
) {
  return render(
    <MemoryRouter initialEntries={["/checkout"]}>
      <Routes>
        <Route path="/checkout" element={<Checkout />} />
        <Route
          path="/orderplaced"
          element={
            <OrderPlaced
              order={{ id: "ORD-2026-001", status: "PENDING" }}
              {...handlers}
            />
          }
        />
        <Route path="/" element={<div>Home Page</div>} />
        <Route path="/cart" element={<div>Cart Page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("Checkout -> OrderPlaced (integration)", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.clear();
    fetchMock.mockResolvedValue(jsonResponse({ data: cart }));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("Place Order di Checkout membuka halaman OrderPlaced", async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(
      await screen.findByRole("button", { name: "Place Order" }),
    );

    expect(
      await screen.findByRole("heading", { name: "Order Placed!" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Order ID").nextElementSibling).toHaveTextContent(
      "ORD-2026-001",
    );
    expect(screen.getByText("Status").nextElementSibling).toHaveTextContent(
      "Pending",
    );
  });

  it("Continue Shopping dari OrderPlaced kembali ke halaman utama", async () => {
    const user = userEvent.setup();
    const onContinueShopping = vi.fn();
    renderFlow({ onContinueShopping });

    await user.click(
      await screen.findByRole("button", { name: "Place Order" }),
    );
    await user.click(
      await screen.findByRole("button", { name: "Continue Shopping" }),
    );

    expect(onContinueShopping).toHaveBeenCalledTimes(1);
    expect(screen.getByText("Home Page")).toBeInTheDocument();
  });

  it("Track Order memanggil handler dan tetap di halaman OrderPlaced", async () => {
    const user = userEvent.setup();
    const onTrackOrder = vi.fn();
    renderFlow({ onTrackOrder });

    await user.click(
      await screen.findByRole("button", { name: "Place Order" }),
    );
    await user.click(await screen.findByRole("button", { name: "Track Order" }));

    expect(onTrackOrder).toHaveBeenCalledTimes(1);
    expect(
      screen.getByRole("heading", { name: "Order Placed!" }),
    ).toBeInTheDocument();
  });

  it("OrderPlaced menggantikan seluruh tampilan Checkout", async () => {
    const user = userEvent.setup();
    renderFlow();

    await user.click(
      await screen.findByRole("button", { name: "Place Order" }),
    );
    await screen.findByRole("heading", { name: "Order Placed!" });

    expect(
      screen.queryByRole("heading", { name: "Checkout" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Slim Jeans")).not.toBeInTheDocument();
  });

  it("keranjang yang gagal dimuat tidak punya tombol Place Order", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ message: "Unauthorized" }, 401));
    renderFlow();

    expect(await screen.findByRole("alert")).toHaveTextContent("Unauthorized");
    expect(
      screen.queryByRole("button", { name: "Place Order" }),
    ).not.toBeInTheDocument();
  });
});