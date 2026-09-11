import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import NewArrivals from "../../components/NewArrivals"
import { getProducts } from "../../services/product.service"
import type { Product } from "../../types/product"

vi.mock("../../services/product.service", () => ({
  getProducts: vi.fn(),
}))

// Isolate NewArrivals' own logic from ProductCard's rendering.
vi.mock("../../components/ProductCard", () => ({
  default: ({ product }: { product: Product }) => (
    <div data-testid="product-card">{product.name}</div>
  ),
}))

const mockedGetProducts = vi.mocked(getProducts)

const makeProduct = (overrides: Partial<Product>): Product => ({
  id: overrides.id ?? crypto.randomUUID(),
  name: "Product",
  description: "desc",
  price: 10,
  imageUrl: "/img.png",
  stock: 5,
  type: "NEW_ARRIVAL",
  categoryId: "cat-1",
  ...overrides,
})

describe("NewArrivals", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches products on mount and renders only NEW_ARRIVAL items", async () => {
    mockedGetProducts.mockResolvedValueOnce([
      makeProduct({ id: "1", name: "New Shirt", type: "NEW_ARRIVAL" }),
      makeProduct({ id: "2", name: "Old Shirt", type: "TOP_SELLING" }),
    ])

    render(<NewArrivals />)

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(1)
    })
    expect(screen.getByText("New Shirt")).toBeInTheDocument()
    expect(screen.queryByText("Old Shirt")).not.toBeInTheDocument()
  })

  it("shows only PREVIEW_COUNT (2) products initially, even with more available", async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, i) =>
        makeProduct({ id: `${i}`, name: `Product ${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(2)
    })
  })

  it("shows the 'View All' button when more than PREVIEW_COUNT products exist", async () => {
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 3 }, (_, i) =>
        makeProduct({ id: `${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)

    expect(
      await screen.findByRole("button", { name: /view all/i })
    ).toBeInTheDocument()
  })

  it("hides the 'View All' button when products.length <= PREVIEW_COUNT", async () => {
    mockedGetProducts.mockResolvedValueOnce([
      makeProduct({ id: "1", type: "NEW_ARRIVAL" }),
      makeProduct({ id: "2", type: "NEW_ARRIVAL" }),
    ])

    render(<NewArrivals />)

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(2)
    })
    expect(
      screen.queryByRole("button", { name: /view all/i })
    ).not.toBeInTheDocument()
  })

  it("expands to show up to PAGE_SIZE (10) products after clicking 'View All'", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) =>
        makeProduct({ id: `${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)

    const viewAllButton = await screen.findByRole("button", {
      name: /view all/i,
    })
    await user.click(viewAllButton)

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(10)
    })
    expect(
      screen.queryByRole("button", { name: /view all/i })
    ).not.toBeInTheDocument()
  })

  it("shows pagination controls only when expanded and totalPages > 1", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) =>
        makeProduct({ id: `${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)

    expect(screen.queryByText(/page \d+ of \d+/i)).not.toBeInTheDocument()

    await user.click(await screen.findByRole("button", { name: /view all/i }))

    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument()
  })

  it("does not show pagination controls when expanded but only one page exists", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, i) =>
        makeProduct({ id: `${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)

    await user.click(await screen.findByRole("button", { name: /view all/i }))

    await waitFor(() => {
      expect(screen.getAllByTestId("product-card")).toHaveLength(5)
    })
    expect(screen.queryByText(/page \d+ of \d+/i)).not.toBeInTheDocument()
  })

  it("navigates to the next page and updates visible products", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) =>
        makeProduct({ id: `${i}`, name: `Product ${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)
    await user.click(await screen.findByRole("button", { name: /view all/i }))
    await screen.findByText("Page 1 of 2")

    expect(screen.getByText("Product 0")).toBeInTheDocument()
    expect(screen.queryByText("Product 10")).not.toBeInTheDocument()

    await user.click(screen.getByRole("button", { name: /^next$/i }))

    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument()
    expect(screen.getByText("Product 10")).toBeInTheDocument()
    expect(screen.queryByText("Product 0")).not.toBeInTheDocument()
  })

  it("disables 'Previous' on the first page and 'Next' on the last page", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) =>
        makeProduct({ id: `${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)
    await user.click(await screen.findByRole("button", { name: /view all/i }))
    await screen.findByText("Page 1 of 2")

    expect(screen.getByRole("button", { name: /previous/i })).toBeDisabled()
    expect(screen.getByRole("button", { name: /^next$/i })).not.toBeDisabled()

    await user.click(screen.getByRole("button", { name: /^next$/i }))

    expect(await screen.findByText("Page 2 of 2")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /previous/i })).not.toBeDisabled()
    expect(screen.getByRole("button", { name: /^next$/i })).toBeDisabled()
  })

  it("navigates back with 'Previous'", async () => {
    const user = userEvent.setup()
    mockedGetProducts.mockResolvedValueOnce(
      Array.from({ length: 15 }, (_, i) =>
        makeProduct({ id: `${i}`, name: `Product ${i}`, type: "NEW_ARRIVAL" })
      )
    )

    render(<NewArrivals />)
    await user.click(await screen.findByRole("button", { name: /view all/i }))
    await user.click(await screen.findByRole("button", { name: /^next$/i }))
    await screen.findByText("Page 2 of 2")

    await user.click(screen.getByRole("button", { name: /previous/i }))

    expect(await screen.findByText("Page 1 of 2")).toBeInTheDocument()
    expect(screen.getByText("Product 0")).toBeInTheDocument()
  })

  it("logs an error and renders no products when the fetch fails", async () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {})
    mockedGetProducts.mockRejectedValueOnce(new Error("Network error"))

    render(<NewArrivals />)

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error))
    })
    expect(screen.queryByTestId("product-card")).not.toBeInTheDocument()
    expect(
      screen.queryByRole("button", { name: /view all/i })
    ).not.toBeInTheDocument()

    consoleErrorSpy.mockRestore()
  })

  it("renders the section heading", async () => {
    mockedGetProducts.mockResolvedValueOnce([])
    render(<NewArrivals />)
    expect(screen.getByText("NEW ARRIVALS")).toBeInTheDocument()
  })
})