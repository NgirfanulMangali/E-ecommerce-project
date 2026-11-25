// E2E/full-journey.spec.ts
import { test, expect, type Page } from "@playwright/test";

const API_URL = "http://localhost:5000";
const VALID_PASSWORD = "Password123!";
const PREVIEW_COUNT = 2; // sama dengan NewArrivals.tsx
const PAGE_SIZE = 10;
const SHIPPING_FEE = 10; // sama dengan Checkout.tsx

// ASUMSI: sesuaikan dengan React Router kamu
const REGISTER_PATH = "/register";
const LOGIN_PATH = "/login";
const HOME_PATH = "/";

type Product = {
  id: string;
  name: string;
  price: number;
  stock: number;
  type: "NEW_ARRIVAL" | "TOP_SELLING";
};

type ApiCart = {
  totalItems: number;
  totalPrice: number;
  items: {
    productId: string;
    quantity: number;
    lineTotal: number;
    product: { name: string; price: number };
  }[];
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

const waitForApi = (page: Page, method: string, path: string) =>
  page.waitForResponse((res) => {
    const url = new URL(res.url());
    return (
      url.port === "5000" &&
      url.pathname === path &&
      res.request().method() === method
    );
  });

const errorMessage = (page: Page) => page.locator("p.text-red-500");

const newArrivalsSection = (page: Page) =>
  page.locator("section").filter({
    has: page.getByRole("heading", { level: 2, name: "NEW ARRIVALS" }),
  });

async function fetchCart(page: Page): Promise<ApiCart> {
  const token = await page.evaluate(() => localStorage.getItem("token"));
  expect(token, "token harus ada di localStorage").toBeTruthy();
  const res = await page.request.get(`${API_URL}/cart`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  expect(res.status()).toBe(200);
  return (await res.json()).data as ApiCart;
}

// Buka detail produk dari daftar di beranda (klik View All bila di luar preview)
async function openProductFromHome(page: Page, product: Product, index: number) {
  await page.goto(HOME_PATH);
  const section = newArrivalsSection(page);

  if (index >= PREVIEW_COUNT) {
    await section.getByRole("button", { name: "View All" }).click();
  }

  await section
    .locator('a[href^="/Productdetail/"]')
    .filter({ has: page.getByRole("heading", { level: 3, name: product.name, exact: true }) })
    .click();

  await expect(page).toHaveURL(new RegExp(`/Productdetail/${product.id}$`));
  await expect(
    page.getByRole("heading", { level: 1, name: product.name })
  ).toBeVisible();
}

test.describe("Full E2E: alur belanja dari register sampai order placed", () => {
  let product: Product;
  let productIndex: number; // posisi di daftar NEW_ARRIVAL (urutan sama dengan UI)

  test.beforeAll(async ({ request }) => {
    const res = await request.get(`${API_URL}/products`);
    expect(res.ok()).toBeTruthy();
    const list = ((await res.json()).data as Product[]).map((p) => ({
      ...p,
      price: Number(p.price),
    }));

    const newArrivals = list.filter((p) => p.type === "NEW_ARRIVAL");
    productIndex = newArrivals.findIndex((p) => p.stock >= 2);
    if (productIndex === -1 || productIndex >= PAGE_SIZE) {
      throw new Error(
        "Seed minimal 1 produk NEW_ARRIVAL dengan stok >= 2 di 10 produk pertama"
      );
    }
    product = newArrivals[productIndex];
  });

  test("user baru: register, login, pilih produk, keranjang, checkout, order placed", async ({
    page,
  }) => {
    test.setTimeout(90_000);

    const name = "Journey Tester";
    const email = uniqueEmail();
    const QTY = 2;

    await test.step("1. Register akun baru lewat form", async () => {
      await page.goto(REGISTER_PATH);

      await page.locator("#name").fill(name);
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(VALID_PASSWORD);
      await page.locator("#confirm-password").fill(VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForApi(page, "POST", "/auth/register"),
        page.getByRole("button", { name: "Create Account" }).click(),
      ]);

      expect(response.status()).toBe(201);
      expect((await response.json()).data).toMatchObject({ name, email });
      await expect(errorMessage(page)).toHaveCount(0);
    });

    await test.step("2. Login gagal dengan password salah, lalu berhasil", async () => {
      await page.goto(LOGIN_PATH);

      await page.locator("#email").fill(email);
      await page.locator("#password").fill("PasswordSalah123");
      const [bad] = await Promise.all([
        waitForApi(page, "POST", "/auth/login"),
        page.getByRole("button", { name: "Login", exact: true }).click(),
      ]);
      expect(bad.status()).toBe(401);
      await expect(errorMessage(page)).toHaveText("Email atau password salah");
      expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();

      await page.locator("#password").fill(VALID_PASSWORD);
      const [ok] = await Promise.all([
        waitForApi(page, "POST", "/auth/login"),
        page.getByRole("button", { name: "Login", exact: true }).click(),
      ]);
      expect(ok.status()).toBe(200);

      const body = await ok.json();
      await expect
        .poll(() => page.evaluate(() => localStorage.getItem("token")))
        .toBe(body.token);
      await expect(errorMessage(page)).toHaveCount(0);
    });

    await test.step("3. Beranda menampilkan daftar produk, buka detail", async () => {
      await openProductFromHome(page, product, productIndex);

      await expect(page.getByText(usd.format(product.price))).toBeVisible();
      await expect(
        page.getByRole("button", { name: "Add to Cart", exact: true })
      ).toBeEnabled();
    });

    await test.step("4. Tambah ke keranjang dengan kuantitas 2", async () => {
      await page.getByRole("button", { name: "Increase quantity" }).click();

      const [response] = await Promise.all([
        waitForApi(page, "POST", "/cart"),
        page.getByRole("button", { name: "Add to Cart", exact: true }).click(),
      ]);

      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toEqual({
        productId: product.id,
        quantity: QTY,
      });
      await expect(page.getByRole("status")).toHaveText("Product added to cart!");
      await expect(page.getByRole("link", { name: /^Cart, 2 items/ })).toBeVisible();
    });

    await test.step("5. Halaman keranjang menampilkan item dan subtotal yang benar", async () => {
      await page.getByRole("link", { name: /^Cart, 2 items/ }).click();
      await expect(page).toHaveURL(/\/cart$/);

      const cart = await fetchCart(page);
      expect(cart.totalItems).toBe(QTY);

      await expect(page.getByRole("heading", { level: 1, name: "Your cart" })).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2, name: product.name })
      ).toBeVisible();
      await expect(page.getByText(`Quantity: ${QTY}`)).toBeVisible();
      await expect(page.getByText(`${usd.format(product.price)} each`)).toBeVisible();

      const summary = page.getByRole("region", { name: "Order Summary" });
      await expect(summary).toContainText(String(QTY));
      await expect(summary).toContainText(usd.format(cart.totalPrice));
      expect(cart.totalPrice).toBeCloseTo(product.price * QTY, 2);
    });

    await test.step("6. Keranjang tetap ada setelah reload (tersimpan di server)", async () => {
      await page.reload();

      await expect(
        page.getByRole("heading", { level: 2, name: product.name })
      ).toBeVisible();
      await expect(page.getByText(`Quantity: ${QTY}`)).toBeVisible();
    });

    await test.step("7. Lanjut ke checkout, total sesuai keranjang + ongkir", async () => {
      await page.getByRole("link", { name: /Go to Checkout/ }).click();
      await expect(page).toHaveURL(/\/checkout$/);

      const cart = await fetchCart(page);

      await expect(
        page.getByRole("heading", { level: 1, name: "Checkout" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { name: `Order Items (${cart.totalItems})` })
      ).toBeVisible();
      await expect(
        page.getByRole("listitem").filter({ hasText: product.name })
      ).toContainText(`x${QTY}`);

      const footer = page.locator("div.fixed.bottom-0");
      await expect(footer).toContainText(usd.format(cart.totalPrice));
      await expect(footer).toContainText(usd.format(SHIPPING_FEE));
      await expect(footer).toContainText(usd.format(cart.totalPrice + SHIPPING_FEE));
    });

    await test.step("8. Place Order mengarah ke halaman Order Placed", async () => {
      await page.getByRole("button", { name: "Place Order" }).click();

      await expect(page).toHaveURL(/\/orderplaced$/);
      await expect(
        page.getByRole("heading", { level: 1, name: "Order Placed!" })
      ).toBeVisible();
      await expect(
        page.getByText("Thank you for shopping with us!")
      ).toBeVisible();

      // nilai tidak di-hardcode: ID tidak kosong, status adalah label valid
      await expect(
        page.getByText("Order ID", { exact: true }).locator("xpath=following-sibling::p")
      ).not.toHaveText("");
      const status = await page
        .getByText("Status", { exact: true })
        .locator("xpath=following-sibling::p")
        .innerText();
      expect(["Pending", "Paid", "Shipped", "Completed", "Cancelled"]).toContain(
        status.trim()
      );
    });

    await test.step("9. Continue Shopping kembali ke beranda", async () => {
      await page.getByRole("button", { name: "Continue Shopping" }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(
        page.getByRole("heading", { level: 2, name: "NEW ARRIVALS" })
      ).toBeVisible();
    });
  });

  test("guest bisa melihat produk, tetapi tidak bisa belanja tanpa login", async ({
    page,
  }) => {
    await test.step("melihat daftar dan detail produk tanpa login", async () => {
      await openProductFromHome(page, product, productIndex);
    });

    await test.step("Add to Cart ditolak (401)", async () => {
      const [response] = await Promise.all([
        waitForApi(page, "POST", "/cart"),
        page.getByRole("button", { name: "Add to Cart", exact: true }).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(page.getByRole("alert")).toHaveText("Authentication required");
      await expect(page.getByRole("status")).toHaveCount(0);
      await expect(page.getByRole("link", { name: /^Cart, 0 items/ })).toBeVisible();
    });

    await test.step("checkout menampilkan pesan error, bukan tombol Place Order", async () => {
      await page.goto("/checkout");

      await expect(page.getByRole("alert")).toHaveText("Authentication required");
      await expect(page.getByRole("button", { name: "Place Order" })).toHaveCount(0);

      await page.getByRole("link", { name: "Back to cart" }).click();
      await expect(page).toHaveURL(/\/cart$/);
    });
  });

  test("user tidak bisa register ulang dengan email yang sama, tetapi bisa login", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail();
    const seed = await request.post(`${API_URL}/auth/register`, {
      data: { name: "Existing", email, password: VALID_PASSWORD },
    });
    expect(seed.status()).toBe(201);

    await test.step("register ulang ditolak (409)", async () => {
      await page.goto(REGISTER_PATH);
      await page.locator("#name").fill("Duplicate");
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(VALID_PASSWORD);
      await page.locator("#confirm-password").fill(VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForApi(page, "POST", "/auth/register"),
        page.getByRole("button", { name: "Create Account" }).click(),
      ]);

      expect(response.status()).toBe(409);
      await expect(errorMessage(page)).toContainText("Email already registered");
    });

    await test.step("akun yang sudah ada tetap bisa login", async () => {
      await page.goto(LOGIN_PATH);
      await page.locator("#email").fill(email);
      await page.locator("#password").fill(VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForApi(page, "POST", "/auth/login"),
        page.getByRole("button", { name: "Login", exact: true }).click(),
      ]);

      expect(response.status()).toBe(200);
      await expect(errorMessage(page)).toHaveCount(0);
    });
  });

  // Mendokumentasikan kondisi sekarang. Ubah saat orderService sudah dibuat.
  test("KNOWN GAP: Place Order belum mengosongkan keranjang di backend", async ({
    page,
    request,
  }) => {
    const email = uniqueEmail();
    expect(
      (
        await request.post(`${API_URL}/auth/register`, {
          data: { name: "Gap Tester", email, password: VALID_PASSWORD },
        })
      ).status()
    ).toBe(201);
    const { token } = await (
      await request.post(`${API_URL}/auth/login`, {
        data: { email, password: VALID_PASSWORD },
      })
    ).json();
    expect(
      (
        await request.post(`${API_URL}/cart`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { productId: product.id, quantity: 1 },
        })
      ).status()
    ).toBe(200);

    await page.addInitScript((t) => localStorage.setItem("token", t), token);
    await page.goto("/checkout");
    await page.getByRole("button", { name: "Place Order" }).click();
    await expect(page).toHaveURL(/\/orderplaced$/);

    const cart = await fetchCart(page);
    // seharusnya 0 setelah order dibuat; saat ini masih terisi
    expect(cart.totalItems).toBe(1);
  });
});