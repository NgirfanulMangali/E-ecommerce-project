// E2E/checkout.spec.ts
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const API_URL = "http://localhost:5000";
const VALID_PASSWORD = "Password123!";
const SHIPPING_FEE = 10; // sama dengan konstanta di Checkout.tsx

// ASUMSI: sesuaikan dengan endpoint produk & route kamu
const PRODUCTS_ENDPOINT = `${API_URL}/products`;
const CHECKOUT_PATH = "/checkout";

type Product = { id: string; name: string; price: number; stock: number };

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

async function createAuthedUser(request: APIRequestContext) {
  const email = uniqueEmail();
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: { name: "Checkout Tester", email, password: VALID_PASSWORD },
  });
  expect(reg.status()).toBe(201);

  const login = await request.post(`${API_URL}/auth/login`, {
    data: { email, password: VALID_PASSWORD },
  });
  expect(login.status()).toBe(200);
  return { token: (await login.json()).token as string };
}

async function loginViaStorage(page: Page, token: string) {
  await page.addInitScript((t) => localStorage.setItem("token", t), token);
}

async function seedCart(
  request: APIRequestContext,
  token: string,
  items: { productId: string; quantity: number }[]
) {
  for (const item of items) {
    const res = await request.post(`${API_URL}/cart`, {
      headers: { Authorization: `Bearer ${token}` },
      data: item,
    });
    expect(res.status()).toBe(200);
  }
}

async function fetchCart(request: APIRequestContext, token: string) {
  const res = await request.get(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data as {
    totalItems: number;
    totalPrice: number;
    items: {
      productId: string;
      quantity: number;
      lineTotal: number;
      product: { name: string; price: number };
    }[];
  };
}

// footer sticky berisi Subtotal, Shipping, Total, dan tombol Place Order
const footer = (page: Page) => page.locator("div.fixed.bottom-0");
const row = (page: Page, label: string) =>
  footer(page).getByText(label, { exact: true }).locator("xpath=..");

const placeOrderButton = (page: Page) =>
  page.getByRole("button", { name: "Place Order" });

test.describe("Fitur Checkout", () => {
  let products: Product[];

  test.beforeAll(async ({ request }) => {
    const res = await request.get(PRODUCTS_ENDPOINT);
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    const list: Product[] = Array.isArray(json) ? json : json.data;
    products = list
      .filter((p) => p.stock >= 2)
      .map((p) => ({ ...p, price: Number(p.price) }));
    if (products.length === 0) {
      throw new Error("Seed minimal 1 produk dengan stok >= 2");
    }
  });

  test.describe("Keranjang berisi", () => {
    test("menampilkan ringkasan order dari keranjang", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      const product = products[0];
      await seedCart(request, token, [{ productId: product.id, quantity: 2 }]);
      const cart = await fetchCart(request, token);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(
        page.getByRole("heading", { level: 1, name: "Checkout" })
      ).toBeVisible();

      // header jumlah item
      await expect(
        page.getByRole("heading", { name: `Order Items (${cart.totalItems})` })
      ).toBeVisible();

      // detail item
      const item = page.getByRole("listitem").filter({ hasText: product.name });
      await expect(item).toBeVisible();
      await expect(item.getByRole("img", { name: product.name })).toBeVisible();
      await expect(item).toContainText(`${currency.format(product.price)} each`);
      await expect(item).toContainText(currency.format(cart.items[0].lineTotal));
      await expect(item).toContainText("x2");
    });

    test("menghitung subtotal, ongkir, dan total dengan benar", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 2 },
      ]);
      const cart = await fetchCart(request, token);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(row(page, "Subtotal")).toContainText(
        currency.format(cart.totalPrice)
      );
      await expect(row(page, "Shipping")).toContainText(
        currency.format(SHIPPING_FEE)
      );
      await expect(row(page, "Total")).toContainText(
        currency.format(cart.totalPrice + SHIPPING_FEE)
      );
    });

    test("menampilkan beberapa produk berbeda", async ({ page, request }) => {
      test.skip(products.length < 2, "Butuh minimal 2 produk dengan stok >= 2");

      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
        { productId: products[1].id, quantity: 2 },
      ]);
      const cart = await fetchCart(request, token);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(
        page.getByRole("heading", { name: `Order Items (${cart.totalItems})` })
      ).toBeVisible();
      await expect(
        page.getByRole("listitem").filter({ hasText: products[0].name })
      ).toBeVisible();
      await expect(
        page.getByRole("listitem").filter({ hasText: products[1].name })
      ).toBeVisible();
      await expect(row(page, "Total")).toContainText(
        currency.format(cart.totalPrice + SHIPPING_FEE)
      );
    });

    test("menampilkan alamat dan metode pembayaran", async ({
      page,
      request,
    }) => {
      // data masih hardcode di komponen (ADDRESS, PAYMENT)
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
      ]);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(
        page.getByRole("heading", { name: "Shipping Address" })
      ).toBeVisible();
      await expect(page.getByText("John Doe")).toBeVisible();
      await expect(page.getByText("123 Main Street")).toBeVisible();

      await expect(
        page.getByRole("heading", { name: "Payment Method" })
      ).toBeVisible();
      await expect(page.getByText("Visa")).toBeVisible();
      await expect(page.getByText("•••• •••• •••• 4242")).toBeVisible();
      await expect(page.getByText("Default")).toHaveCount(2);
    });

    test("tombol Go back kembali ke halaman keranjang", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
      ]);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await page.getByRole("button", { name: "Go back" }).click();
      await expect(page).toHaveURL(/\/cart$/);
    });
  });

  test.describe("Place Order", () => {
    test("klik Place Order mengarah ke halaman order placed", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
      ]);

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(placeOrderButton(page)).toBeEnabled();
      await placeOrderButton(page).click();

      await expect(page).toHaveURL(/\/orderplaced$/);
    });

    test("belum ada request pembuatan order ke backend", async ({
      page,
      request,
    }) => {
      // dokumentasi kondisi sekarang: handlePlaceOrder masih TODO.
      // Hapus/ubah test ini saat orderService sudah dipanggil.
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
      ]);

      const orderRequests: string[] = [];
      page.on("request", (req) => {
        if (req.method() === "POST" && /\/orders?(\/|$)/.test(req.url())) {
          orderRequests.push(req.url());
        }
      });

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);
      await placeOrderButton(page).click();
      await expect(page).toHaveURL(/\/orderplaced$/);

      expect(orderRequests).toHaveLength(0);
    });
  });

  test.describe("Keranjang kosong", () => {
    test("menampilkan pesan keranjang kosong dan link belanja", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request); // user baru, belum ada keranjang
      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(page.getByText("Your cart is empty")).toBeVisible();
      await expect(placeOrderButton(page)).toHaveCount(0);

      await page.getByRole("link", { name: "Continue Shopping" }).click();
      await expect(page).toHaveURL(/\/products$/);
    });
  });

  test.describe("Error & loading", () => {
    test("user belum login melihat pesan error (401)", async ({ page }) => {
      await page.goto(CHECKOUT_PATH); // tanpa token

      await expect(page.getByRole("alert")).toHaveText("Authentication required");
      await expect(placeOrderButton(page)).toHaveCount(0);
    });

    test("token tidak valid menampilkan pesan error", async ({ page }) => {
      await loginViaStorage(page, "token.palsu.sekali");
      await page.goto(CHECKOUT_PATH);

      await expect(page.getByRole("alert")).toHaveText(
        "Invalid or expired token"
      );
    });

    test("link Back to cart di state error mengarah ke /cart", async ({
      page,
    }) => {
      await page.goto(CHECKOUT_PATH);
      await expect(page.getByRole("alert")).toBeVisible();

      await page.getByRole("link", { name: "Back to cart" }).click();
      await expect(page).toHaveURL(/\/cart$/);
    });

    test("menampilkan loading state saat keranjang dimuat", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);
      await seedCart(request, token, [
        { productId: products[0].id, quantity: 1 },
      ]);

      await page.route("**/cart", async (route) => {
        if (route.request().method() !== "GET") return route.continue();
        await new Promise((r) => setTimeout(r, 1000));
        await route.continue();
      });

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(page.getByText("Loading your order...")).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 1, name: "Checkout" })
      ).toBeVisible();
      await expect(page.getByText("Loading your order...")).toHaveCount(0);
    });

    test("menampilkan pesan error saat server error (500)", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);

      await page.route("**/cart", (route) =>
        route.request().method() === "GET"
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

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(page.getByRole("alert")).toHaveText(
        "An internal server error occurred. Please try again later."
      );
    });

    test("menampilkan pesan error saat jaringan gagal", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);

      await page.route("**/cart", (route) =>
        route.request().method() === "GET"
          ? route.abort("failed")
          : route.continue()
      );

      await loginViaStorage(page, token);
      await page.goto(CHECKOUT_PATH);

      await expect(page.getByRole("alert")).toBeVisible();
    });
  });
});