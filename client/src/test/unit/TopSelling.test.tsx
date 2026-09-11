import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";

import TopSelling from "../../components/TopSelling";
import { getProducts } from "../../services/product.service";

import type { Product } from "../../types/product";

vi.mock("../../services/product.service", () => ({
  getProducts: vi.fn(),
}));

vi.mock("../../components/ProductCard", () => ({
  default: ({ product }: { product: Product }) => (
    <article data-testid="product-card">
      <h3>{product.name}</h3>
      <p>{product.price}</p>
    </article>
  ),
}));

const mockedGetProducts = vi.mocked(getProducts);

const createProduct = (
  id: string,
  name: string,
  type: Product["type"] = "TOP_SELLING"
): Product => ({
  id,
  name,
  description: `Description for ${name}`,
  price: 100000,
  imageUrl: `/images/${id}.jpg`,
  stock: 10,
  type,
  categoryId: "category-1",
});

describe("TopSelling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the TOP SELLING heading", () => {
    mockedGetProducts.mockResolvedValue([]);

    render(<TopSelling />);

    expect(
      screen.getByRole("heading", { name: "TOP SELLING" })
    ).toBeInTheDocument();
  });

  it("calls getProducts when component renders", async () => {
    mockedGetProducts.mockResolvedValue([]);

    render(<TopSelling />);

    await waitFor(() => {
      expect(mockedGetProducts).toHaveBeenCalledTimes(1);
    });
  });

  it("renders only TOP_SELLING products", async () => {
    const products = [
      createProduct("1", "Top Selling Shirt", "TOP_SELLING"),
      createProduct("2", "Top Selling Pants", "TOP_SELLING"),
      createProduct("3", "New Arrival Shirt", "NEW_ARRIVAL"),
    ];

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    await waitFor(() => {
      expect(screen.getByText("Top Selling Shirt")).toBeInTheDocument();
      expect(screen.getByText("Top Selling Pants")).toBeInTheDocument();
    });

    expect(
      screen.queryByText("New Arrival Shirt")
    ).not.toBeInTheDocument();
  });

  it("shows only two products initially", async () => {
    const products = [
      createProduct("1", "Product 1"),
      createProduct("2", "Product 2"),
      createProduct("3", "Product 3"),
      createProduct("4", "Product 4"),
    ];

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(2);
    });
  });

  it("shows View All button when there are more than two products", async () => {
    const products = [
      createProduct("1", "Product 1"),
      createProduct("2", "Product 2"),
      createProduct("3", "Product 3"),
    ];

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "View All" })
      ).toBeInTheDocument();
    });
  });

  it("shows all products after clicking View All", async () => {
    const user = userEvent.setup();

    const products = [
      createProduct("1", "Product 1"),
      createProduct("2", "Product 2"),
      createProduct("3", "Product 3"),
      createProduct("4", "Product 4"),
    ];

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    const viewAllButton = await screen.findByRole("button", {
      name: "View All",
    });

    await user.click(viewAllButton);

    expect(screen.getByText("Product 3")).toBeInTheDocument();
    expect(screen.getByText("Product 4")).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "View All" })).not.toBeInTheDocument();
  });

  it("shows pagination when there are more than ten products", async () => {
    const products = Array.from({ length: 12 }, (_, index) =>
      createProduct(`${index + 1}`, `Product ${index + 1}`)
    );

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    const viewAllButton = await screen.findByRole("button", {
      name: "View All",
    });

    const user = userEvent.setup();

    await user.click(viewAllButton);

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Next" })
    ).toBeInTheDocument();
  });

  it("moves to the next page when Next is clicked", async () => {
    const products = Array.from({ length: 12 }, (_, index) =>
      createProduct(`${index + 1}`, `Product ${index + 1}`)
    );

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "View All" })
    );

    expect(screen.getByText("Page 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("Product 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Page 2 of 2")).toBeInTheDocument();

    expect(screen.getByText("Product 11")).toBeInTheDocument();
    expect(screen.getByText("Product 12")).toBeInTheDocument();

    expect(screen.queryByText("Product 1")).not.toBeInTheDocument();
  });

  it("disables Previous on the first page", async () => {
    const products = Array.from({ length: 12 }, (_, index) =>
      createProduct(`${index + 1}`, `Product ${index + 1}`)
    );

    mockedGetProducts.mockResolvedValue(products);

    render(<TopSelling />);

    const user = userEvent.setup();

    await user.click(
      await screen.findByRole("button", { name: "View All" })
    );

    expect(
      screen.getByRole("button", { name: "Previous" })
    ).toBeDisabled();
  });

  it("handles getProducts error without crashing", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockedGetProducts.mockRejectedValue(new Error("Failed to fetch products"));

    render(<TopSelling />);

    await waitFor(() => {
      expect(mockedGetProducts).toHaveBeenCalledTimes(1);
    });

    expect(
      screen.getByRole("heading", { name: "TOP SELLING" })
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });
});