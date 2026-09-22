import { describe, it, expect } from "vitest"
import { render, screen } from "@testing-library/react"
import { MemoryRouter } from "react-router"
import ProductCard from "../../components/ProductCard"
import type { Product } from "../../types/product"

const baseProduct: Product = {
  id: "1",
  name: "Classic Tee",
  description: "A classic tee",
  price: 29.99,
  imageUrl: "/images/classic-tee.png",
  stock: 10,
  type: "NEW_ARRIVAL",
  categoryId: "cat-1",
}

const renderCard = (product: Product = baseProduct) =>
  render(
    <MemoryRouter>
      <ProductCard product={product} />
    </MemoryRouter>
  )

describe("ProductCard", () => {
  it("renders the product name", () => {
    renderCard()
    expect(screen.getByText("Classic Tee")).toBeInTheDocument()
  })

  it("links to the product detail page for that product id", () => {
    renderCard()
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "/Productdetail/1"
    )
  })

  it("renders the image with correct src and alt text", () => {
    renderCard()
    const img = screen.getByRole("img", { name: "Classic Tee" })
    expect(img).toHaveAttribute("src", "/images/classic-tee.png")
  })

  it("formats the price as USD currency", () => {
    renderCard()
    expect(screen.getByText("$29.99")).toBeInTheDocument()
  })

  it("formats whole-number prices without unnecessary decimals padding issues", () => {
    renderCard({ ...baseProduct, price: 100 })
    expect(screen.getByText("$100.00")).toBeInTheDocument()
  })

  it("formats prices with more than 2 decimal places by rounding", () => {
    renderCard({ ...baseProduct, price: 19.999 })
    expect(screen.getByText("$20.00")).toBeInTheDocument()
  })
})