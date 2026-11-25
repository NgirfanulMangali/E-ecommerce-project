// E2E/product-list.spec.ts
import { test, expect, type Page } from "@playwright/test";

const HOME_PATH = "/"; // ASUMSI: NewArrivals & TopSelling dirender di beranda
const API_URL = "http://localhost:5000";

const PREVIEW_COUNT = 2; // sama dengan di komponen
const PAGE_SIZE = 10;

type ProductType = "NEW_ARRIVAL" | "TOP_SELLING";
type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  type: ProductType;
  categoryId: string;
};

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

// gambar 1x1 agar test tidak bergantung pada file di server
const PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

function makeProducts(count: number, type: ProductType, prefix: string): Product[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + 1}`,
    name: `${prefix} Item ${i + 1}`,
    description: "Produk uji",
    price: 10 + i + 0.5,
    imageUrl: PIXEL,
    stock: 5,
    type,
    categoryId: "cat-1",
  }));
}

async function mockProducts(page: Page, products: Product[]) {
  await page.route(
    (url) => url.port === "5000" && url.pathname === "/products",
    (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        headers: { "access-control-allow-origin": "*" },
        body: JSON.stringify({ data: products }),
      })
  );
}

const section = (page: Page, title: "NEW ARRIVALS" | "TOP SELLING") =>
  page.locator("section").filter({
    has: page.getByRole("heading", { level: 2, name: title }),
  });

const cards = (sec: ReturnType<typeof section>) =>
  sec.locator('a[href^="/Productdetail/"]');

const viewAll = (sec: ReturnType<typeof section>) =>
  sec.getByRole("button", { name: "View All" });

test.describe("Fitur Daftar Produk", () => {
  test.describe("Data asli dari API", () => {
    let products: Product[];

    test.beforeAll(async ({ request }) => {
      const res = await request.get(`${API_URL}/products`);
      expect(res.status()).toBe(200);
      products = ((await res.json()).data as Product[]).map((p) => ({
        ...p,
        price: Number(p.price),
      }));
    });

    test("menampilkan judul section New Arrivals dan Top Selling", async ({
      page,
    }) => {
      await page.goto(HOME_PATH);

      await expect(
        page.getByRole("heading", { level: 2, name: "NEW ARRIVALS" })
      ).toBeVisible();
      await expect(
        page.getByRole("heading", { level: 2, name: "TOP SELLING" })
      ).toBeVisible();
    });

    test("jumlah kartu preview sesuai data di backend", async ({ page }) => {
      await page.goto(HOME_PATH);

      for (const [title, type] of [
        ["NEW ARRIVALS", "NEW_ARRIVAL"],
        ["TOP SELLING", "TOP_SELLING"],
      ] as const) {
        const total = products.filter((p) => p.type === type).length;
        await expect(cards(section(page, title))).toHaveCount(
          Math.min(PREVIEW_COUNT, total)
        );
      }
    });

    test("kartu menampilkan nama, harga USD, dan gambar", async ({ page }) => {
      const first = products.find((p) => p.type === "NEW_ARRIVAL");
      test.skip(!first, "Seed minimal 1 produk bertipe NEW_ARRIVAL");

      await page.goto(HOME_PATH);

      const sec = section(page, "NEW ARRIVALS");
      const card = cards(sec).first();
      await expect(card).toBeVisible();
      await expect(card.getByRole("heading", { level: 3 })).toHaveText(
        first!.name
      );
      await expect(card).toContainText(usd.format(first!.price));
      await expect(card.getByRole("img", { name: first!.name })).toBeVisible();
    });

    test("klik kartu membuka halaman detail produk", async ({ page }) => {
      const first = products.find((p) => p.type === "NEW_ARRIVAL");
      test.skip(!first, "Seed minimal 1 produk bertipe NEW_ARRIVAL");

      await page.goto(HOME_PATH);
      await cards(section(page, "NEW ARRIVALS")).first().click();

      await expect(page).toHaveURL(new RegExp(`/Productdetail/${first!.id}$`));
      await expect(
        page.getByRole("heading", { level: 1, name: first!.name })
      ).toBeVisible();
    });

    test("GET /products tidak membocorkan field sensitif dan harga berupa angka", async ({
      request,
    }) => {
      const res = await request.get(`${API_URL}/products`);
      const body = await res.json();

      expect(Array.isArray(body.data)).toBe(true);
      for (const p of body.data) {
        expect(typeof p.price).toBe("number");
        expect(p.imageUrl).toMatch(/^https?:\/\//);
      }
    });
  });

  test.describe("Filter berdasarkan tipe (mock)", () => {
    test("tiap section hanya menampilkan produk dengan tipenya", async ({
      page,
    }) => {
      await mockProducts(page, [
        ...makeProducts(2, "NEW_ARRIVAL", "Baru"),
        ...makeProducts(2, "TOP_SELLING", "Laris"),
      ]);
      await page.goto(HOME_PATH);

      const newSec = section(page, "NEW ARRIVALS");
      const topSec = section(page, "TOP SELLING");

      await expect(cards(newSec)).toHaveCount(2);
      await expect(cards(topSec)).toHaveCount(2);
      await expect(newSec.getByText("Baru Item 1")).toBeVisible();
      await expect(newSec.getByText("Laris Item 1")).toHaveCount(0);
      await expect(topSec.getByText("Laris Item 1")).toBeVisible();
      await expect(topSec.getByText("Baru Item 1")).toHaveCount(0);
    });
  });

  test.describe("View All (mock)", () => {
    test("tombol View All tidak muncul jika produk <= preview", async ({
      page,
    }) => {
      await mockProducts(page, makeProducts(PREVIEW_COUNT, "NEW_ARRIVAL", "Baru"));
      await page.goto(HOME_PATH);

      const sec = section(page, "NEW ARRIVALS");
      await expect(cards(sec)).toHaveCount(PREVIEW_COUNT);
      await expect(viewAll(sec)).toHaveCount(0);
    });

    test("View All menampilkan semua produk lalu tombol hilang", async ({
      page,
    }) => {
      await mockProducts(page, makeProducts(5, "NEW_ARRIVAL", "Baru"));
      await page.goto(HOME_PATH);

      const sec = section(page, "NEW ARRIVALS");
      await expect(cards(sec)).toHaveCount(PREVIEW_COUNT);

      await viewAll(sec).click();

      await expect(cards(sec)).toHaveCount(5);
      await expect(viewAll(sec)).toHaveCount(0);
      // 5 produk muat di satu halaman, jadi tidak ada pagination
      await expect(sec.getByRole("button", { name: "Next" })).toHaveCount(0);
    });

    test("View All di satu section tidak memengaruhi section lain", async ({
      page,
    }) => {
      await mockProducts(page, [
        ...makeProducts(5, "NEW_ARRIVAL", "Baru"),
        ...makeProducts(5, "TOP_SELLING", "Laris"),
      ]);
      await page.goto(HOME_PATH);

      const newSec = section(page, "NEW ARRIVALS");
      const topSec = section(page, "TOP SELLING");

      await viewAll(newSec).click();

      await expect(cards(newSec)).toHaveCount(5);
      await expect(cards(topSec)).toHaveCount(PREVIEW_COUNT);
      await expect(viewAll(topSec)).toBeVisible();
    });
  });

  test.describe("Pagination (mock)", () => {
    // 25 produk -> 3 halaman: 10, 10, 5
    test.beforeEach(async ({ page }) => {
      await mockProducts(page, makeProducts(25, "NEW_ARRIVAL", "Baru"));
      await page.goto(HOME_PATH);
      await viewAll(section(page, "NEW ARRIVALS")).click();
    });

    test("halaman pertama menampilkan 10 produk dan Previous nonaktif", async ({
      page,
    }) => {
      const sec = section(page, "NEW ARRIVALS");

      await expect(cards(sec)).toHaveCount(PAGE_SIZE);
      await expect(sec.getByText("Page 1 of 3")).toBeVisible();
      await expect(sec.getByRole("button", { name: "Previous" })).toBeDisabled();
      await expect(sec.getByRole("button", { name: "Next" })).toBeEnabled();
      await expect(sec.getByText("Baru Item 1", { exact: true })).toBeVisible();
      await expect(sec.getByText("Baru Item 10", { exact: true })).toBeVisible();
      await expect(sec.getByText("Baru Item 11", { exact: true })).toHaveCount(0);
    });

    test("Next berpindah halaman dan isi produk berganti", async ({ page }) => {
      const sec = section(page, "NEW ARRIVALS");

      await sec.getByRole("button", { name: "Next" }).click();

      await expect(sec.getByText("Page 2 of 3")).toBeVisible();
      await expect(cards(sec)).toHaveCount(PAGE_SIZE);
      await expect(sec.getByText("Baru Item 11", { exact: true })).toBeVisible();
      await expect(sec.getByText("Baru Item 1", { exact: true })).toHaveCount(0);
      await expect(sec.getByRole("button", { name: "Previous" })).toBeEnabled();
    });

    test("halaman terakhir menampilkan sisa 5 produk dan Next nonaktif", async ({
      page,
    }) => {
      const sec = section(page, "NEW ARRIVALS");

      await sec.getByRole("button", { name: "Next" }).click();
      await sec.getByRole("button", { name: "Next" }).click();

      await expect(sec.getByText("Page 3 of 3")).toBeVisible();
      await expect(cards(sec)).toHaveCount(5);
      await expect(sec.getByRole("button", { name: "Next" })).toBeDisabled();
      await expect(sec.getByText("Baru Item 25", { exact: true })).toBeVisible();
    });

    test("Previous kembali ke halaman sebelumnya", async ({ page }) => {
      const sec = section(page, "NEW ARRIVALS");

      await sec.getByRole("button", { name: "Next" }).click();
      await sec.getByRole("button", { name: "Previous" }).click();

      await expect(sec.getByText("Page 1 of 3")).toBeVisible();
      await expect(sec.getByText("Baru Item 1", { exact: true })).toBeVisible();
    });
  });

  test.describe("Data kosong & error", () => {
    test("tanpa produk: section tampil tanpa kartu dan tanpa View All", async ({
      page,
    }) => {
      await mockProducts(page, []);
      await page.goto(HOME_PATH);

      for (const title of ["NEW ARRIVALS", "TOP SELLING"] as const) {
        const sec = section(page, title);
        await expect(sec.getByRole("heading", { level: 2 })).toBeVisible();
        await expect(cards(sec)).toHaveCount(0);
        await expect(viewAll(sec)).toHaveCount(0);
      }
    });

    test("server error (500): halaman tidak crash dan tidak ada kartu", async ({
      page,
    }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      await page.route(
        (url) => url.port === "5000" && url.pathname === "/products",
        (route) =>
          route.fulfill({
            status: 500,
            contentType: "application/json",
            headers: { "access-control-allow-origin": "*" },
            body: JSON.stringify({
              message: "An internal server error occurred. Please try again later.",
            }),
          })
      );
      await page.goto(HOME_PATH);

      await expect(
        page.getByRole("heading", { level: 2, name: "NEW ARRIVALS" })
      ).toBeVisible();
      await expect(cards(section(page, "NEW ARRIVALS"))).toHaveCount(0);
      // komponen hanya console.error, tidak menampilkan pesan ke user
      await expect.poll(() => consoleErrors.length).toBeGreaterThan(0);
    });

    test("jaringan gagal: halaman tidak crash", async ({ page }) => {
      await page.route(
        (url) => url.port === "5000" && url.pathname === "/products",
        (route) => route.abort("failed")
      );
      await page.goto(HOME_PATH);

      await expect(
        page.getByRole("heading", { level: 2, name: "TOP SELLING" })
      ).toBeVisible();
      await expect(cards(section(page, "TOP SELLING"))).toHaveCount(0);
    });
  });

  test.describe("Item statis di Top Selling", () => {
    test("menampilkan dua produk hardcode dengan harga Rupiah", async ({
      page,
    }) => {
      // dokumentasi kondisi sekarang: array `produc` masih hardcode di komponen
      await mockProducts(page, []);
      await page.goto(HOME_PATH);

      const sec = section(page, "TOP SELLING");
      await expect(sec.getByText("Vertical Striped Shirt")).toBeVisible();
      await expect(sec.getByText("Courage Graphic T-Shirt")).toBeVisible();
      await expect(sec.getByText(/Rp\s?212\.000/).first()).toBeVisible();
      // item statis bukan link ke halaman detail
      await expect(cards(sec)).toHaveCount(0);
    });
  });
});