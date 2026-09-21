import { ADMIN, CLIENT, OTP_CODE, TWO_FACTOR } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";
import { readMockState } from "../support/api";

test.describe("sign in", () => {
  test("valid credentials open a session and land on the storefront", async ({ page }) => {
    await page.goto("/vi/login");

    await field(page, "email").fill(CLIENT.email);
    await field(page, "password").fill(CLIENT.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.getByRole("button", { name: new RegExp(CLIENT.name) })).toBeVisible();
  });

  test("a wrong password reports the API's message and keeps you put", async ({ page }) => {
    await page.goto("/vi/login");

    await field(page, "email").fill(CLIENT.email);
    await field(page, "password").fill("wrongPassword1");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByText("Email or password is incorrect.")).toBeVisible();
    await expect(page).toHaveURL(/\/vi\/login/);
  });

  test("a field error from the API lands next to its field", async ({ page }) => {
    await page.goto("/vi/login");

    await field(page, "email").fill(CLIENT.email);
    await field(page, "password").fill("short1");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    const passwordField = page.locator('[data-field="password"]');

    await expect(
      passwordField.getByText("Password must be between 8 and 20 characters."),
    ).toBeVisible();
  });

  test("an account with 2FA needs its authenticator code", async ({ page }) => {
    await page.goto("/vi/login");

    await field(page, "email").fill(TWO_FACTOR.email);
    await field(page, "password").fill(TWO_FACTOR.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByText("Two-factor code is required.")).toBeVisible();

    await field(page, "totpCode").fill(TWO_FACTOR.totpCode);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.getByRole("button", { name: new RegExp(TWO_FACTOR.name) })).toBeVisible();
  });

  test("a guarded page remembers where you were headed", async ({ page }) => {
    await page.goto("/vi/orders");

    await expect(page).toHaveURL(/\/vi\/login\?next=%2Fvi%2Forders/);

    await field(page, "email").fill(CLIENT.email);
    await field(page, "password").fill(CLIENT.password);
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page).toHaveURL(/\/vi\/orders$/);
  });
});

test.describe("register", () => {
  test("sends an OTP, then creates the account", async ({ page }) => {
    await page.goto("/vi/register");

    await field(page, "email").fill("newcomer@ecom.test");
    await field(page, "name").fill("Ngoc Newcomer");
    await field(page, "phoneNumber").fill("0912345678");
    await field(page, "password").fill("newcomerPass1");
    await field(page, "confirmPassword").fill("newcomerPass1");

    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByText("Đã gửi mã vào email của bạn.")).toBeVisible();

    await field(page, "code").fill(OTP_CODE);
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();

    await expect(page).toHaveURL(/\/vi\/login/);

    const state = await readMockState();

    expect(state.users.map((user: { email: string }) => user.email)).toContain(
      "newcomer@ecom.test",
    );
  });

  test("mismatched passwords are caught before the request goes out", async ({ page }) => {
    let requested = false;

    page.on("request", (request) => {
      if (request.url().includes("/api/proxy/auth/register")) requested = true;
    });

    await page.goto("/vi/register");

    await field(page, "email").fill("mismatch@ecom.test");
    await field(page, "name").fill("Mis Match");
    await field(page, "phoneNumber").fill("0912345679");
    await field(page, "password").fill("password111");
    await field(page, "confirmPassword").fill("password222");
    await field(page, "code").fill(OTP_CODE);
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();

    await expect(page.getByText("Hai mật khẩu không khớp.")).toBeVisible();
    expect(requested).toBe(false);
  });

  test("a wrong OTP comes back on the code field", async ({ page }) => {
    await page.goto("/vi/register");

    await field(page, "email").fill("badotp@ecom.test");
    await field(page, "name").fill("Bad Otp");
    await field(page, "phoneNumber").fill("0912345670");
    await field(page, "password").fill("badOtpPass1");
    await field(page, "confirmPassword").fill("badOtpPass1");
    await field(page, "code").fill("000000");
    await page.getByRole("button", { name: "Tạo tài khoản" }).click();

    await expect(
      page.locator('[data-field="code"]').getByText("OTP code is invalid."),
    ).toBeVisible();
  });
});

test.describe("password reset", () => {
  test("resets the password and lets the new one sign in", async ({ page }) => {
    await page.goto("/vi/forgot-password");

    await field(page, "email").fill(CLIENT.email);
    await page.getByRole("button", { name: "Gửi mã" }).click();
    await expect(page.getByText("Đã gửi mã vào email của bạn.")).toBeVisible();

    await field(page, "code").fill(OTP_CODE);
    await field(page, "password").fill("rotatedPass1");
    await field(page, "confirmPassword").fill("rotatedPass1");
    await page.getByRole("button", { name: "Đặt lại mật khẩu" }).click();

    await expect(page).toHaveURL(/\/vi\/login/);

    await field(page, "email").fill(CLIENT.email);
    await field(page, "password").fill("rotatedPass1");
    await page.getByRole("button", { name: "Đăng nhập" }).click();

    await expect(page.getByRole("button", { name: new RegExp(CLIENT.name) })).toBeVisible();
  });
});

test.describe("sign out and OAuth", () => {
  test("signing out drops the session everywhere", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi");

    await page.getByRole("button", { name: new RegExp(ADMIN.name) }).click();
    await page.getByRole("menuitem", { name: "Đăng xuất" }).click();

    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();

    const cookies = await page.context().cookies();

    expect(cookies.filter((cookie) => cookie.name.startsWith("ecom_"))).toEqual([]);
  });

  test("the Google round trip ends in a real session", async ({ page }) => {
    await page.goto("/vi/login");

    await page.getByRole("button", { name: "Tiếp tục với Google" }).click();

    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.getByRole("button", { name: new RegExp(CLIENT.name) })).toBeVisible();
  });

  test("a failed Google round trip says so instead of hanging", async ({ page }) => {
    await page.goto("/vi/oauth/google?errorMessage=Failed%20to%20google%20login.");

    await expect(page.getByText("Đăng nhập Google thất bại.")).toBeVisible();
    await expect(page.getByRole("link", { name: "Đăng nhập" })).toBeVisible();
  });
});
