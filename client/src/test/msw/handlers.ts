import { http, HttpResponse } from "msw";
import type { ProductDetail } from "../../types/Product.type";

const API_BASE_URL = "http://localhost:5000";

export const mockProduct: ProductDetail = {
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

export const handlers = [
  http.get(`${API_BASE_URL}/products/:id`, ({ params }) => {
    const { id } = params;

    if (id === "prod-1") {
      return HttpResponse.json({ data: mockProduct });
    }

    if (id === "out-of-stock") {
      return HttpResponse.json({ data: { ...mockProduct, id, stock: 0 } });
    }

    return HttpResponse.json(
      { message: "Product not found" },
      { status: 404 }
    );
  }),
];