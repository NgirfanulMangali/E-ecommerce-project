import { http, HttpResponse } from "msw";
import type { ProductDetail } from "../../types/Product.type";
import type { Cart } from "../../types/cart";

// product detail
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

// cart

export const mockCart: Cart = {
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
        type: "NEW_ARRIVAL" as any,
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
        type: "TOP_SELLING" as any,
      },
    },
  ],
};

export const handlers = [

  // product detail

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

  // cart

  http.get(`${API_BASE_URL}/cart`, ({ request }) => {
    const auth = request.headers.get("authorization");

    if (auth !== "Bearer valid-token") {
      return HttpResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    return HttpResponse.json({ data: mockCart });
  }),
];



