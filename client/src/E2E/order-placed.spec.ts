// E2E/order-placed.spec.ts
import { test, expect, type APIRequestContext, type Page } from "@playwright/test";

const API_URL = "http://localhost:5000";
const VALID_PASSWORD = "Password123!";

// ASUMSI: sesuaikan dengan route & endpoint kamu
const ORDER_PLACED_PATH = "/orderplaced";
const PRODUCTS_ENDPOINT = `${API_URL}/products`;

// sama dengan STATUS_LABEL di OrderPlaced.tsx
const STATUS_LABELS = ["Pending", "Paid", "Shipped", "Completed", "Cancelled"];

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

async function createAuthedUser(request: APIRequestContext) {
  const email = uniqueEmail();
  const reg = await request.post(`${API_URL}/auth/register`, {
    data: { name: "Order Tester", email, password: VALID_PASSWORD },
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

// teks nilai (<p> di bawah label) dari kartu info
const infoValue = (page: Page, label: string) =>
  page.getByText(label, { exact: true }).locator("xpath=following-sibling::p");

test.describe("Fitur Order Placed", () => {
  test.describe("Konten halaman", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto(ORDER_PLACED_PATH);
    });

    test("menampilkan judul dan pesan terima kasih", async ({ page }) => {
      await expect(
        page.getByRole("heading", { level: 1, name: "Order Placed!" })
      ).toBeVisible();
      await expect(
        page.getByText(
          "Your order has been placed successfully. Thank you for shopping with us!"
        )
      ).toBeVisible();
    });

    test("menampilkan Order ID dan Status", async ({ page }) => {
      await expect(page.getByText("Order ID", { exact: true })).toBeVisible();
      await expect(page.getByText("Status", { exact: true })).toBeVisible();

      // nilai tidak di-hardcode: ID tidak kosong, status harus label yang valid
      await expect(infoValue(page, "Order ID")).not.toHaveText("");
      const status = (await infoValue(page, "Status").innerText()).trim();
      expect(STATUS_LABELS).toContain(status);
    });

    test("menampilkan tombol Continue Shopping dan Track Order", async ({
      page,
    }) => {
      await expect(
        page.getByRole("button", { name: "Continue Shopping" })
      ).toBeEnabled();
      await expect(
        page.getByRole("button", { name: "Track Order" })
      ).toBeEnabled();
    });

    test("elemen dekoratif disembunyikan dari accessibility tree", async ({
      page,
    }) => {
      // confetti dan ikon SVG memakai aria-hidden
      await expect(page.locator(".op-confetti").first()).toBeAttached();
      await expect(page.locator("div[aria-hidden='true'] .op-confetti")).toHaveCount(
        14
      );
      await expect(page.locator("svg[aria-hidden='true']")).not.toHaveCount(0);
    });
  });

  test.describe("Navigasi", () => {
    test("Continue Shopping mengarah ke beranda", async ({ page }) => {
      await page.goto(ORDER_PLACED_PATH);

      await page.getByRole("button", { name: "Continue Shopping" }).click();

      await expect(page).toHaveURL(/\/$/);
      await expect(
        page.getByRole("heading", { name: "Order Placed!" })
      ).toHaveCount(0);
    });

    test("Track Order tidak mengubah halaman (belum ada handler)", async ({
      page,
    }) => {
      // dokumentasi kondisi sekarang: onTrackOrder tidak di-pass dari route.
      // Ubah test ini saat fitur tracking sudah ada.
      await page.goto(ORDER_PLACED_PATH);

      await page.getByRole("button", { name: "Track Order" }).click();

      await expect(page).toHaveURL(new RegExp(`${ORDER_PLACED_PATH}$`));
      await expect(
        page.getByRole("heading", { name: "Order Placed!" })
      ).toBeVisible();
    });
  });

  test.describe("Alur dari checkout", () => {
    test("Place Order di checkout berakhir di halaman Order Placed", async ({
      page,
      request,
    }) => {
      const { token } = await createAuthedUser(request);

      const res = await request.get(PRODUCTS_ENDPOINT);
      expect(res.ok()).toBeTruthy();
      const json = await res.json();
      const list: { id: string; stock: number }[] = Array.isArray(json)
        ? json
        : json.data;
      const product = list.find((p) => p.stock >= 1);
      if (!product) throw new Error("Seed minimal 1 produk dengan stok >= 1");

      const seed = await request.post(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { productId: product.id, quantity: 1 },
      });
      expect(seed.status()).toBe(200);

      await loginViaStorage(page, token);
      await page.goto("/checkout");
      await page.getByRole("button", { name: "Place Order" }).click();

      await expect(page).toHaveURL(new RegExp(`${ORDER_PLACED_PATH}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: "Order Placed!" })
      ).toBeVisible();
    });
  });

  test.describe("Aksesibilitas & animasi", () => {
    test("centang langsung terlihat saat prefers-reduced-motion aktif", async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(ORDER_PLACED_PATH);

      const check = page.locator(".op-check");
      await expect(check).toHaveCSS("stroke-dashoffset", "0px");
    });

    test("centang tergambar penuh setelah animasi selesai", async ({ page }) => {
      await page.emulateMedia({ reducedMotion: "no-preference" });
      await page.goto(ORDER_PLACED_PATH);

      // animasi: delay 0.35s + durasi 0.4s, jadi pakai polling bukan sleep
      await expect(page.locator(".op-check")).toHaveCSS(
        "stroke-dashoffset",
        "0px"
      );
    });
  });
});