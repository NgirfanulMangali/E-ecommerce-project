// e2e/register.spec.ts
import { test, expect, type Page } from "@playwright/test";

const REGISTER_PATH = "/register"; // sesuaikan dengan route halaman SignupForm
const API_URL = "http://localhost:5000";
const REGISTER_ENDPOINT = "**/auth/register";

const VALID_PASSWORD = "Password123!"; // 12 karakter (valid: 10-20)

const uniqueEmail = () =>
  `e2e_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@example.com`;

type FormInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

async function fillForm(page: Page, input: FormInput) {
  await page.locator("#name").fill(input.name);
  await page.locator("#email").fill(input.email);
  await page.locator("#password").fill(input.password);
  await page
    .locator("#confirm-password")
    .fill(input.confirmPassword ?? input.password);
}

const submitButton = (page: Page) =>
  page.getByRole("button", { name: "Create Account" });

const errorMessage = (page: Page) => page.locator("p.text-red-500");

function waitForRegisterResponse(page: Page) {
  return page.waitForResponse(
    (res) =>
      res.url().endsWith("/auth/register") && res.request().method() === "POST"
  );
}

test.describe("Fitur Register", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(REGISTER_PATH);
  });

  test("menampilkan semua elemen form register", async ({ page }) => {
    await expect(page.getByText("Create your account").first()).toBeVisible();
    await expect(page.locator("#name")).toBeVisible();
    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
    await expect(page.locator("#confirm-password")).toBeVisible();
    await expect(submitButton(page)).toBeEnabled();
    await expect(errorMessage(page)).toHaveCount(0);
  });

  test.describe("Berhasil", () => {
    test("register dengan data valid", async ({ page }) => {
      const email = uniqueEmail();
      await fillForm(page, {
        name: "John Doe",
        email,
        password: VALID_PASSWORD,
      });

      const [response] = await Promise.all([
        waitForRegisterResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(201);

      // payload yang dikirim sesuai input (confirmPassword tidak ikut terkirim)
      expect(response.request().postDataJSON()).toEqual({
        name: "John Doe",
        email,
        password: VALID_PASSWORD,
      });

      const body = await response.json();
      expect(body.message).toBe("Registration successful");
      expect(body.data).toMatchObject({ name: "John Doe", email });
      expect(body.data).not.toHaveProperty("password");

      await expect(errorMessage(page)).toHaveCount(0);
      await expect(submitButton(page)).toBeEnabled();
    });

    for (const length of [10, 20]) {
      test(`menerima password dengan panjang batas (${length} karakter)`, async ({
        page,
      }) => {
        const password = "a".repeat(length);
        await fillForm(page, {
          name: "Boundary User",
          email: uniqueEmail(),
          password,
        });

        const [response] = await Promise.all([
          waitForRegisterResponse(page),
          submitButton(page).click(),
        ]);

        expect(response.status()).toBe(201);
        await expect(errorMessage(page)).toHaveCount(0);
      });
    }
  });

  test.describe("Validasi di frontend (tanpa request ke API)", () => {
    let apiCalls = 0;

    test.beforeEach(async ({ page }) => {
      apiCalls = 0;
      page.on("request", (req) => {
        if (req.url().endsWith("/auth/register")) apiCalls++;
      });
    });

    test("password dan konfirmasi password tidak sama", async ({ page }) => {
      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: VALID_PASSWORD,
        confirmPassword: "BedaPassword123",
      });
      await submitButton(page).click();

      await expect(errorMessage(page)).toHaveText("Passwords do not match");
      expect(apiCalls).toBe(0);
    });

    test("password kurang dari 10 karakter", async ({ page }) => {
      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: "short123", // 8 karakter
      });
      await submitButton(page).click();

      await expect(errorMessage(page)).toHaveText(
        "Password must be at least 10 characters long"
      );
      expect(apiCalls).toBe(0);
    });

    test("form kosong diblokir oleh atribut required browser", async ({
      page,
    }) => {
      await submitButton(page).click();

      const isMissing = await page
        .locator("#name")
        .evaluate((el: HTMLInputElement) => el.validity.valueMissing);
      expect(isMissing).toBe(true);
      expect(apiCalls).toBe(0);
    });

    test("format email tidak valid diblokir oleh browser", async ({ page }) => {
      await fillForm(page, {
        name: "John Doe",
        email: "bukan-email",
        password: VALID_PASSWORD,
      });
      await submitButton(page).click();

      const typeMismatch = await page
        .locator("#email")
        .evaluate((el: HTMLInputElement) => el.validity.typeMismatch);
      expect(typeMismatch).toBe(true);
      expect(apiCalls).toBe(0);
    });
  });

  test.describe("Validasi di backend", () => {
    test("email tanpa domain TLD ditolak server (INVALID email format)", async ({
      page,
    }) => {
      // "user@domain" lolos validasi browser, tapi gagal regex di backend
      await fillForm(page, {
        name: "John Doe",
        email: "user@domain",
        password: VALID_PASSWORD,
      });

      const [response] = await Promise.all([
        waitForRegisterResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(400);
      await expect(errorMessage(page)).toHaveText("Invalid email format");
    });

    test("password lebih dari 20 karakter ditolak server", async ({ page }) => {
      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: "a".repeat(21),
      });

      const [response] = await Promise.all([
        waitForRegisterResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(400);
      await expect(errorMessage(page)).toHaveText(
        "Password must be less than 20 characters long"
      );
    });

    test("email yang sudah terdaftar ditolak (409)", async ({
      page,
      request,
    }) => {
      const email = uniqueEmail();

      // Seed user lewat API langsung
      const seed = await request.post(`${API_URL}/auth/register`, {
        data: { name: "Existing User", email, password: VALID_PASSWORD },
      });
      expect(seed.status()).toBe(201);

      await fillForm(page, {
        name: "Another User",
        email,
        password: VALID_PASSWORD,
      });

      const [response] = await Promise.all([
        waitForRegisterResponse(page),
        submitButton(page).click(),
      ]);

      expect(response.status()).toBe(409);
      await expect(errorMessage(page)).toContainText(
        "Email already registered"
      );
      await expect(submitButton(page)).toBeEnabled();
    });
  });

  test.describe("Kondisi error & loading", () => {
    test("menampilkan loading state saat request berjalan", async ({ page }) => {
      await page.route(REGISTER_ENDPOINT, async (route) => {
        await new Promise((r) => setTimeout(r, 1000));
        await route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ message: "Registration successful", data: {} }),
        });
      });

      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: VALID_PASSWORD,
      });
      await submitButton(page).click();

      const loadingButton = page.getByRole("button", {
        name: "Creating account...",
      });
      await expect(loadingButton).toBeVisible();
      await expect(loadingButton).toBeDisabled();

      // setelah selesai, tombol kembali normal
      await expect(submitButton(page)).toBeEnabled();
    });

    test("menampilkan pesan error saat server error (500)", async ({ page }) => {
      await page.route(REGISTER_ENDPOINT, (route) =>
        route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({
            message: "An error occurred on the server. Please try again later",
            code: "INTERNAL_SERVER_ERROR",
          }),
        })
      );

      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: VALID_PASSWORD,
      });
      await submitButton(page).click();

      await expect(errorMessage(page)).toHaveText(
        "An error occurred on the server. Please try again later"
      );
      await expect(submitButton(page)).toBeEnabled();
    });

    test("menampilkan pesan error saat jaringan gagal", async ({ page }) => {
      await page.route(REGISTER_ENDPOINT, (route) => route.abort("failed"));

      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: VALID_PASSWORD,
      });
      await submitButton(page).click();

      await expect(errorMessage(page)).toBeVisible();
      await expect(submitButton(page)).toBeEnabled();
    });

    test("pesan error hilang saat submit ulang dengan data benar", async ({
      page,
    }) => {
      await fillForm(page, {
        name: "John Doe",
        email: uniqueEmail(),
        password: VALID_PASSWORD,
        confirmPassword: "salah-confirm",
      });
      await submitButton(page).click();
      await expect(errorMessage(page)).toHaveText("Passwords do not match");

      await page.locator("#confirm-password").fill(VALID_PASSWORD);
      await Promise.all([
        waitForRegisterResponse(page),
        submitButton(page).click(),
      ]);

      await expect(errorMessage(page)).toHaveCount(0);
    });
  });
});