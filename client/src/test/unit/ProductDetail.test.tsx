import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProductDetail } from "../../components/Productdetail";
import { productService, ApiError } from "../../services/Productdetail.service";
import type { ProductDetail as ProductDetailType } from "../../types/Product.type";

vi.mock("../../services/Productdetail.service", async () => {
  const actual = await vi.importActual("../../services/Productdetail.service");
  return {
    ...actual,
    productService: {
      getById: vi.fn(),
    },
  };
});

const mockProduct: ProductDetailType = {
  id: "prod-1",
  name: "Wireless Mouse",
  description: "A comfortable wireless mouse",
  price: 29.99,
  imageUrl: "https://example.com/mouse.jpg",
  stock: 10,
  categoryId: "cat-1",
  type: "NEW_ARRIVAL" as any,
  createdAt: "2025-01-01T00:00:00.000Z",
  updatedAt: "2025-01-01T00:00:00.000Z",
};

function renderComponent(productId = "prod-1") {
  return render(
    <MemoryRouter>
      <ProductDetail productId={productId} />
    </MemoryRouter>
  );
}

describe("ProductDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading skeleton initially", () => {
    (productService.getById as any).mockReturnValue(new Promise(() => {})); // never resolves
    renderComponent();

    // Skeleton renders instead of product content
    expect(screen.queryByText("Wireless Mouse")).not.toBeInTheDocument();
  });

  it("renders product details after a successful fetch", async () => {
    (productService.getById as any).mockResolvedValue(mockProduct);

    renderComponent();

    expect(await screen.findByText("Wireless Mouse")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("A comfortable wireless mouse")).toBeInTheDocument();
    expect(screen.getByText("10 in stock")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Wireless Mouse" })).toHaveAttribute(
      "src",
      mockProduct.imageUrl
    );
  });

  it("shows 'Out of stock' and disables Add to Cart when stock is 0", async () => {
    (productService.getById as any).mockResolvedValue({ ...mockProduct, stock: 0 });

    renderComponent();

    expect(await screen.findByText("Out of stock")).toBeInTheDocument();
    const addToCartBtn = screen.getByRole("button", { name: /out of stock/i });
    expect(addToCartBtn).toBeDisabled();
  });

  it("shows an error message and retry button when the fetch fails", async () => {
    (productService.getById as any).mockRejectedValue(
      new ApiError("Product not found", 404)
    );

    renderComponent();

    expect(await screen.findByText("Product not found")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
  });

  it("shows a generic error message for non-ApiError failures", async () => {
    (productService.getById as any).mockRejectedValue(new Error("Network down"));

    renderComponent();

    expect(
      await screen.findByText("Something went wrong. Please try again.")
    ).toBeInTheDocument();
  });

  it("increments and decrements quantity within stock bounds", async () => {
    const user = userEvent.setup();
    (productService.getById as any).mockResolvedValue({ ...mockProduct, stock: 2 });

    renderComponent();
    await screen.findByText("Wireless Mouse");

    const increaseBtn = screen.getByRole("button", { name: /increase quantity/i });
    const decreaseBtn = screen.getByRole("button", { name: /decrease quantity/i });

    expect(screen.getByText("1")).toBeInTheDocument();

    await user.click(increaseBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    // Should not exceed stock (2)
    await user.click(increaseBtn);
    expect(screen.getByText("2")).toBeInTheDocument();

    await user.click(decreaseBtn);
    expect(screen.getByText("1")).toBeInTheDocument();

    // Should not go below 1
    await user.click(decreaseBtn);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("allows selecting a color", async () => {
    const user = userEvent.setup();
    (productService.getById as any).mockResolvedValue(mockProduct);

    renderComponent();
    await screen.findByText("Wireless Mouse");

    const forestColorBtn = screen.getByRole("button", { name: "Forest" });
    await user.click(forestColorBtn);

    // Check icon renders inside the selected button
    expect(forestColorBtn.querySelector("svg")).toBeInTheDocument();
  });

  it("allows selecting a size", async () => {
    const user = userEvent.setup();
    (productService.getById as any).mockResolvedValue(mockProduct);

    renderComponent();
    await screen.findByText("Wireless Mouse");

    const smallBtn = screen.getByRole("button", { name: "Small" });
    await user.click(smallBtn);

    expect(smallBtn.className).toContain("bg-neutral-900");
  });

  it("re-fetches when productId prop changes", async () => {
    (productService.getById as any).mockResolvedValue(mockProduct);

    const { rerender } = render(
      <MemoryRouter>
        <ProductDetail productId="prod-1" />
      </MemoryRouter>
    );
    await screen.findByText("Wireless Mouse");

    (productService.getById as any).mockResolvedValue({
      ...mockProduct,
      id: "prod-2",
      name: "Bluetooth Keyboard",
    });

    rerender(
      <MemoryRouter>
        <ProductDetail productId="prod-2" />
      </MemoryRouter>
    );

    expect(await screen.findByText("Bluetooth Keyboard")).toBeInTheDocument();
    expect(productService.getById).toHaveBeenCalledWith("prod-2", expect.anything());
  });
});