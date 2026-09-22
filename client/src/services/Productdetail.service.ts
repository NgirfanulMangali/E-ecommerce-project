import type { ProductDetail } from "../types/Product.type";

// Set VITE_API_URL in .env for other environments (e.g. https://api.yourapp.com)
const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:5000";

interface ApiResponse<T> {
  data: T;
}

interface ApiErrorBody {
  message: string;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    // Backend sends { message } on 400/404/500 — see product-detailed.controller.ts
    const body = (await response.json().catch(() => null)) as ApiErrorBody | null;
    throw new ApiError(body?.message ?? response.statusText, response.status);
  }
  const body = (await response.json()) as ApiResponse<T>;
  return body.data;
}

export const productService = {
  async getById(id: string, signal?: AbortSignal): Promise<ProductDetail> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, { signal });
    return handleResponse<ProductDetail>(response);
  },
};