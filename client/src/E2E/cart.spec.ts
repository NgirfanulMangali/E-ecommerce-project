// E2E/add-to-cart.spec.ts
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const API_URL = "http://localhost:5000";
const VALID_PASSWORD = "Password123!";

const PRODUCTS_ENDPOINT = `${API_URL}/products`;
const productPath = (id: string) => `/Productdetail/${id}`;

type Product = { id: string; name: string; price: number; stock: number };

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

// Buat user baru via API, lalu login untuk mendapatkan token
async function createAuthedUser(request: APIRequestContext) {
  const email = uniqueEmail();
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: { name: "Cart Tester", email, password: VALID_PASSWORD },
  });
  expect(reg.status()).toBe(201);

  const login = await request.post(`${API_URL}/auth/login`, {
    data: { email, password: VALID_PASSWORD },
  });
  expect(login.status()).toBe(200);
  const { token } = await login.json();
  return { email, token: token as string };
}

async function loginViaStorage(page: Page, token: string) {
  await page.addInitScript((t) => localStorage.setItem("token", t), token);
}

async function openProductPage(page: Page, item: Product) {
  await page.goto(productPath(item.id));
  await expect(
    page.getByRole("heading", { level: 1, name: item.name })
  ).toBeVisible();
}

const apiCart = async (request: APIRequestContext, token: string) => {
  const res = await request.get(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data;
};

const addToCartButton = (page: Page) =>
  page.getByRole("button", { name: "Add to Cart", exact: true });

function waitForAddToCart(page: Page) {
  return page.waitForResponse(
    (res) => res.url().endsWith("/cart") && res.request().method() === "POST"
  );
}

test.describe("Fitur Add to Cart", () => {
  let product: Product;

  test.beforeAll(async ({ request }) => {
    const res = await request.get(PRODUCTS_ENDPOINT);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const list: Product[] = Array.isArray(json) ? json : json.data;

    // butuh stok >= 3 supaya skenario kuantitas bermakna
    const found = list.find((p) => p.stock >= 3);
    if (!found) throw new Error("Seed minimal 1 produk dengan stok >= 3");
    product = { ...found, price: Number(found.price) };
  });

  test("menampilkan tombol Add to Cart dan kuantitas awal 1", async ({
    page,
    request,
  }) => {
    const { token } = await createAuthedUser(request);
    await loginViaStorage(page, token);
    await openProductPage(page, product);
    await expect(addToCartButton(page)).toBeEnabled();
    await expect(page.getByText(`${product.stock} in stock`)).toBeVisible();
    await expect(page.getByRole("status")).toHaveCount(0);
    await expect(page.getByRole("alert")).toHaveCount(0);
  });

  test.describe("Kuantitas", () => {
    test.beforeEach(async ({ page, request }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);
    });

    test("tombol + dan - mengubah kuantitas, minimal 1", async ({ page }) => {
      const qty = page.getByRole("button", { name: "Increase quantity" });
      const dec = page.getByRole("button", { name: "Decrease quantity" });
      const value = page.locator("span.w-4.text-center");

      await expect(value).toHaveText("1");
      await qty.click();
      await expect(value).toHaveText("2");
      await dec.click();
      await dec.click(); // tidak boleh turun di bawah 1
      await expect(value).toHaveText("1");
    });

    test("kuantitas tidak melebihi stok", async ({ page }) => {
      const inc = page.getByRole("button", { name: "Increase quantity" });
      const value = page.locator("span.w-4.text-center");

      for (let i = 0; i < product.stock + 2; i++) await inc.click();
      await expect(value).toHaveText(String(product.stock));
    });
  });

  test.describe("Berhasil", () => {
    test("menambahkan produk dengan kuantitas default", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      const [response] = await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toEqual({
        productId: product.id,
        quantity: 1,
      });
      expect(response.request().headers()["authorization"]).toBe(
        `Bearer ${token}`
      );

      await expect(page.getByRole("status")).toHaveText(
        "Product added to cart!"
      );
      await expect(page.getByRole("alert")).toHaveCount(0);
      await expect(addToCartButton(page)).toBeEnabled();

      // verifikasi data tersimpan di backend
      const cart = await apiCart(request, token);
      expect(cart.totalItems).toBe(1);
      expect(cart.items[0]).toMatchObject({
        productId: product.id,
        quantity: 1,
      });
    });

    test("menambahkan produk dengan kuantitas lebih dari 1", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      const inc = page.getByRole("button", { name: "Increase quantity" });
      await inc.click();
      await inc.click(); // kuantitas jadi 3

      const [response] = await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      expect(response.request().postDataJSON()).toEqual({
        productId: product.id,
        quantity: 3,
      });
      await expect(page.getByRole("status")).toBeVisible();

      const cart = await apiCart(request, token);
      expect(cart.totalItems).toBe(3);
      expect(cart.totalPrice).toBeCloseTo(product.price * 3, 2);
    });

    test("menambahkan produk yang sama dua kali menjumlahkan kuantitas", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      for (let i = 0; i < 2; i++) {
        await Promise.all([
          waitForAddToCart(page),
          addToCartButton(page).click(),
        ]);
      }

      const cart = await apiCart(request, token);
      expect(cart.items).toHaveLength(1); // satu baris, bukan dua
      expect(cart.items[0].quantity).toBe(2);
    });

    test("item muncul di halaman keranjang", async ({ page, request }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await page.getByRole("button", { name: "Increase quantity" }).click();
      await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      await page.goto("/cart");
      await expect(
        page.getByRole("heading", { name: "Your cart" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2, name: product.name })
      ).toBeVisible();
      await expect(page.getByText("Quantity: 2")).toBeVisible();
      await expect(page.getByRole("link", { name: /Go to Checkout/ })).toBeVisible();
    });

    test("badge keranjang di header ikut bertambah", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await expect(page.getByRole("link", { name: "Cart, 0 items" })).toBeVisible();

      await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      await expect(
        page.getByRole("link", { name: "Cart, 1 items" })
      ).toBeVisible();
    });
  });

  test.describe("Gagal", () => {
    test("user belum login ditolak (401)", async ({ page }) => {
      // tanpa token di localStorage
      await openProductPage(page, product);

      const [response] = await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(page.getByRole("alert")).toHaveText("Authentication required");
      await expect(page.getByRole("status")).toHaveCount(0);
    });

    test("token tidak valid ditolak (401)", async ({ page }) => {
      await loginViaStorage(page, "token.palsu.sekali");
      await openProductPage(page, product);

      const [response] = await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(page.getByRole("alert")).toHaveText(
        "Invalid or expired token"
      );
    });

    test("ditolak saat total melebihi stok (400)", async ({ page, request }) => {
      const { token } = await createAuthedUser(request);

      // isi keranjang sampai stok habis lewat API
      const seed = await request.post(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: product.id, quantity: product.stock },
      });
      expect(seed.status()).toBe(200);

      await loginViaStorage(page, token);
      await openProductPage(page, product);

      const [response] = await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);

      expect(response.status()).toBe(400);
      await expect(page.getByRole("alert")).toHaveText("Not enough stock");
      await expect(page.getByRole("status")).toHaveCount(0);

      // isi keranjang tidak berubah
      const cart = await apiCart(request, token);
      expect(cart.items[0].quantity).toBe(product.stock);
    });

    test("pesan sukses lama hilang saat percobaan berikutnya gagal", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await Promise.all([
        waitForAddToCart(page),
        addToCartButton(page).click(),
      ]);
      await expect(page.getByRole("status")).toBeVisible();

      await page.route("**/cart", (route) =>
        route.request().method() === "POST"
          ? route.fulfill({
              status: 400,
              contentType: "application/json",
              body: JSON.stringify({ message: "Not enough stock" }),
            })
          : route.continue()
      );

      await addToCartButton(page).click();
      await expect(page.getByRole("alert")).toHaveText("Not enough stock");
      await expect(page.getByRole("status")).toHaveCount(0);
    });
  });

  test.describe("Kondisi loading & error jaringan", () => {
    test("menampilkan state 'Adding...' selama request", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await page.route("**/cart", async (route) => {
        if (route.request().method() !== "POST") return route.continue();
        await new Promise((r) => setTimeout(r, 1000));
        await route.continue();
      });

      await addToCartButton(page).click();

      const adding = page.getByRole("button", { name: "Adding..." });
      await expect(adding).toBeVisible();
      await expect(adding).toBeDisabled();

      await expect(page.getByRole("status")).toBeVisible();
      await expect(addToCartButton(page)).toBeEnabled();
    });

    test("menampilkan pesan error saat server error (500)", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await page.route("**/cart", (route) =>
        route.request().method() === "POST"
          ? route.fulfill({
              status: 500,
              contentType: "application/json",
              body: JSON.stringify({
                message:
                  "An internal server error occurred. Please try again later.",
              }),
            })
          : route.continue()
      );

      await addToCartButton(page).click();

      await expect(page.getByRole("alert")).toHaveText(
        "An internal server error occurred. Please try again later."
      );
      await expect(addToCartButton(page)).toBeEnabled();
    });

    test("menampilkan pesan error saat jaringan gagal", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await loginViaStorage(page, token);
      await openProductPage(page, product);

      await page.route("**/cart", (route) =>
        route.request().method() === "POST"
          ? route.abort("failed")
          : route.continue()
      );

      await addToCartButton(page).click();

      await expect(page.getByRole("alert")).toBeVisible();
      await expect(addToCartButton(page)).toBeEnabled();
    });
  });
});