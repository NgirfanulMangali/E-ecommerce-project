import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { http, HttpResponse } from "msw";
import { ProductDetail } from "../../components/Productdetail";
import { server } from "../msw/server";
import { mockProduct } from "../msw/handlers";

const API_BASE_URL = "http://localhost:5000";

function renderComponent(productId = "prod-1") {
  return render(
    <MemoryRouter>
      <ProductDetail productId={productId} />
    </MemoryRouter>
  );
}

describe("ProductDetail (integration — real fetch via MSW)", () => {
  it("fetches and renders product details from the API", async () => {
    renderComponent("prod-1");

    // Loading skeleton shown first
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();

    expect(await screen.findByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("A comfortable wireless mouse")).toBeInTheDocument();
    expect(screen.getByText("10 in stock")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Wireless Mouse" })).toHaveAttribute(
      "src",
      mockProduct.imageUrl
    );
  });

  it("shows out-of-stock state when the API returns stock 0", async () => {
    renderComponent("out-of-stock");

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
    const addToCartBtn = screen.getByRole("button", { name: /out of stock/i });
    expect(addToCartBtn).toBeDisabled();
  });

  it("shows a 404 error message when the product doesn't exist", async () => {
    renderComponent("nonexistent-id");

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows a generic error message on a 500 server error", async () => {
    server.use(
      http.get(`${API_BASE_URL}/products/:id`, () => {
        return HttpResponse.json(
          { message: "Internal server error" },
          { status: 500 }
        );
      })
    );

    renderComponent("prod-1");

    expect(await screen.findByText("Internal server error")).toBeInTheDocument();
  });

  it("shows a generic fallback message on a network failure", async () => {
    server.use(
      http.get(`${API_BASE_URL}/products/:id`, () => {
        return HttpResponse.error();
      })
    );

    renderComponent("prod-1");

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  it("lets the user pick color, size, and quantity, then re-fetches on productId change", async () => {
    const user = userEvent.setup();
    const { rerender } = renderComponent("prod-1");

    await screen.findByText("Wireless Mouse");

    // Select a color
    const forestBtn = screen.getByRole("button", { name: "Forest" });
    await user.click(forestBtn);
    expect(forestBtn.querySelector("svg")).toBeInTheDocument();

    // Select a size
    const smallBtn = screen.getByRole("button", { name: "Small" });
    await user.click(smallBtn);
    expect(smallBtn.className).toContain("bg-neutral-900");

    // Adjust quantity
    const increaseBtn = screen.getByRole("button", { name: /increase quantity/i });
    await user.click(increaseBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Switch productId — should re-fetch and reset quantity
    rerender(
      <MemoryRouter>
        <ProductDetail productId="out-of-stock" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
    // quantity resets to 1 on new product load
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});