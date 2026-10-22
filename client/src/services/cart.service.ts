
import type { Cart, CartResponse } from "../types/cart";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:5000";

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function requestCart(
  path: string,
  options: RequestInit = {},
): Promise<Cart> {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const body = (await response.json()) as CartResponse;

  if (!response.ok) {
    throw new Error(
      body.message ?? `Request failed: ${response.status}`,
    );
  }

  return body.data;
}

export const cartService = {
  getCart(): Promise<Cart> {
    return requestCart("/cart");
  },

  addItem(productId: string, quantity: number): Promise<Cart> {
    return requestCart("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity }),
    });
  },
};
