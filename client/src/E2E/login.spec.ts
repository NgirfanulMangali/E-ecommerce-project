// E2E/login.spec.ts
import { test, expect, type Page } from "@playwright/test";

const LOGIN_PATH = "/login"; // sesuaikan dengan route LoginForm
const API_URL = "http://localhost:5000";
const LOGIN_ENDPOINT = "**/auth/login";

const VALID_PASSWORD = "Password123!";

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

async function fillForm(page: Page, email: string, password: string) {
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
}

const submitButton = (page: Page) =>
  page.getByRole("button", { name: "Login", exact: true });

const errorMessage = (page: Page) => page.locator("p.text-red-500");

function waitForLoginResponse(page: Page) {
  return page.waitForResponse(
    (res) =>
      res.url().endsWith("/auth/login") && res.request().method() === "POST"
  );
}

test.describe("Fitur Login", () => {
  // user yang dibuat sekali lewat API, dipakai untuk semua test login
  let email: string;

  test.beforeAll(async ({ request }) => {
    email = uniqueEmail();
    const res = await request.post(`${API_URL}/auth/register`, {
      data: { name: "Login Tester", email, password: VALID_PASSWORD },
    });
    expect(res.status()).toBe(201);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto(LOGIN_PATH);
  });

  test("menampilkan semua elemen form login", async ({ page }) => {
    await expect(page.getByText("Login to your account", { exact: true })).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(submitButton(page)).toBeEnabled();
    await expect(
      page.getByRole("button", { name: "Login with Google" })
    ).toBeVisible();
    await expect(page.getByText("Forgot your password?")).toBeVisible();
    await expect(errorMessage(page)).toHaveCount(0);
  });

  test.describe("Berhasil", () => {
    test("login dengan kredensial valid", async ({ page }) => {
      await fillForm(page, email, VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(200);
      expect(response.request().postDataJSON()).toEqual({
        email,
        password: VALID_PASSWORD,
      });

      const body = await response.json();
      expect(body.message).toBe("Login berhasil");
      expect(typeof body.token).toBe("string");
      expect(body.data).toMatchObject({ name: "Login Tester", email });
      expect(body.data).not.toHaveProperty("password");

      await expect(errorMessage(page)).toHaveCount(0);
      await expect(submitButton(page)).toBeEnabled();
    });

    test("token dan data user tersimpan di localStorage", async ({ page }) => {
      await fillForm(page, email, VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);
      const body = await response.json();

      await expect
        .poll(() => page.evaluate(() => localStorage.getItem("token")))
        .toBe(body.token);

      const storedUser = await page.evaluate(() =>
        JSON.parse(localStorage.getItem("user") ?? "null")
      );
      expect(storedUser).toMatchObject({ name: "Login Tester", email });
    });

    test("token yang dikembalikan bisa dipakai untuk endpoint terproteksi", async ({
      page,
      request,
    }) => {
      await fillForm(page, email, VALID_PASSWORD);
      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);
      const { token } = await response.json();

      // JWT berformat 3 bagian dipisah titik
      expect(token.split(".")).toHaveLength(3);

      // tanpa token ditolak, dengan token dikenali (bukan 401)
      // ganti endpoint dengan route yang memakai requireAuth, mis. /cart
      const noToken = await request.get(`${API_URL}/cart`);
      expect(noToken.status()).toBe(401);

      const withToken = await request.get(`${API_URL}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      expect(withToken.status()).not.toBe(401);
    });
  });

  test.describe("Validasi di frontend (tanpa request ke API)", () => {
    let apiCalls = 0;

    test.beforeEach(async ({ page }) => {
      apiCalls = 0;
      page.on("request", (req) => {
        if (req.url().endsWith("/auth/login")) apiCalls++;
      });
    });

    test("form kosong diblokir oleh atribut required", async ({ page }) => {
      await submitButton(page).click();

      const isMissing = await page
        .locator("#email")
        .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
      expect(isMissing).toBe(true);
      expect(apiCalls).toBe(0);
    });

    test("password kosong diblokir oleh atribut required", async ({ page }) => {
      await page.locator("#email").fill(email);
      await submitButton(page).click();

      const isMissing = await page
        .locator("#password")
        .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
      expect(isMissing).toBe(true);
      expect(apiCalls).toBe(0);
    });

    test("format email tidak valid diblokir oleh browser", async ({ page }) => {
      await fillForm(page, "bukan-email", VALID_PASSWORD);
      await submitButton(page).click();

      const typeMismatch = await page
        .locator("#email")
        .evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
      expect(typeMismatch).toBe(true);
      expect(apiCalls).toBe(0);
    });
  });

  test.describe("Kredensial salah (backend)", () => {
    test("password salah ditolak (401)", async ({ page }) => {
      await fillForm(page, email, "PasswordSalah123");

      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(errorMessage(page)).toHaveText("Email atau password salah");
      await expect(submitButton(page)).toBeEnabled();

      const token = await page.evaluate(() => localStorage.getItem("token"));
      expect(token).toBeNull();
    });

    test("email tidak terdaftar ditolak (401)", async ({ page }) => {
      await fillForm(page, uniqueEmail(), VALID_PASSWORD);

      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(errorMessage(page)).toHaveText("Email atau password salah");
    });

    test("pesan error sama untuk email salah dan password salah", async ({
      page,
    }) => {
      // memastikan server tidak membocorkan email mana yang terdaftar
      await fillForm(page, email, "PasswordSalah123");
      await submitButton(page).click();
      await expect(errorMessage(page)).toBeVisible();
      const wrongPassword = await errorMessage(page).innerText();

      await fillForm(page, uniqueEmail(), VALID_PASSWORD);
      await submitButton(page).click();
      await expect(errorMessage(page)).toHaveText(wrongPassword);
    });

    test("email dan password hanya spasi ditolak server", async ({ page }) => {
      // spasi lolos atribut required, tetapi tidak cocok dengan user manapun
      await fillForm(page, email, "          ");

      const [response] = await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(401);
      await expect(errorMessage(page)).toBeVisible();
    });
  });

  test.describe("Kondisi error & loading", () => {
    test("menampilkan loading state saat request berjalan", async ({ page }) => {
      await page.route(LOGIN_ENDPOINT, async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Login berhasil",
            token: "dummy.jwt.token",
            data: { id: "1", name: "Login Tester", email },
          }),
        });
      });

      await fillForm(page, email, VALID_PASSWORD);
      await submitButton(page).click();

      const loadingButton = page.getByRole("button", { name: "Logging in..." });
      await expect(loadingButton).toBeVisible();
      await expect(loadingButton).toBeDisabled();

      await expect(submitButton(page)).toBeEnabled();
    });

    test("menampilkan pesan error saat server error (500)", async ({ page }) => {
      await page.route(LOGIN_ENDPOINT, (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            message: "Terjadi kesalahan pada server. Silakan coba lagi nanti",
          }),
        })
      );

      await fillForm(page, email, VALID_PASSWORD);
      await submitButton(page).click();

      await expect(errorMessage(page)).toHaveText(
        "Terjadi kesalahan pada server. Silakan coba lagi nanti"
      );
      await expect(submitButton(page)).toBeEnabled();
    });

    test("menampilkan pesan fallback jika body error bukan JSON", async ({
      page,
    }) => {
      await page.route(LOGIN_ENDPOINT, (route) =>
        route.fulfill({ status: 502, contentType: "text/plain", body: "Bad Gateway" })
      );

      await fillForm(page, email, VALID_PASSWORD);
      await submitButton(page).click();

      await expect(errorMessage(page)).toHaveText("Request failed: 502");
    });

    test("menampilkan pesan error saat jaringan gagal", async ({ page }) => {
      await page.route(LOGIN_ENDPOINT, (route) => route.abort("failed"));

      await fillForm(page, email, VALID_PASSWORD);
      await submitButton(page).click();

      await expect(errorMessage(page)).toBeVisible();
      await expect(submitButton(page)).toBeEnabled();
    });

    test("pesan error hilang saat submit ulang dengan data benar", async ({
      page,
    }) => {
      await fillForm(page, email, "PasswordSalah123");
      await submitButton(page).click();
      await expect(errorMessage(page)).toHaveText("Email atau password salah");

      await page.locator("#password").fill(VALID_PASSWORD);
      await Promise.all([
        waitForLoginResponse(page),
        submitButton(page).click(),
      ]);

      await expect(errorMessage(page)).toHaveCount(0);
    });
  });
});