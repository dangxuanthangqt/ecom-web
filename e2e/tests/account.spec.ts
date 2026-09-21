import { CLIENT, TWO_FACTOR } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";

test.describe("account", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto("/vi/account");
  });

  test("shows who you are, with role and status", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "Tài khoản của tôi" }),
    ).toBeVisible();
    await expect(page.getByText(CLIENT.email)).toBeVisible();
    await expect(page.getByText("Vai trò: CLIENT")).toBeVisible();
    await expect(page.getByText("Trạng thái: ACTIVE")).toBeVisible();
  });

  test("the profile form is prefilled and saves", async ({ page }) => {
    await expect(field(page, "name")).toHaveValue(CLIENT.name);

    await field(page, "name").fill("Chi Đã Đổi Tên");
    await page.getByRole("button", { name: "Cập nhật hồ sơ" }).click();

    await expect(page.getByText("Đã cập nhật hồ sơ")).toBeVisible();
    // The header reads the same profile, so it must follow the change.
    await expect(
      page.getByRole("button", { name: /Chi Đã Đổi Tên/ }),
    ).toBeVisible();
  });

  test("a server-side field error lands on the field", async ({ page }) => {
    await field(page, "currentPassword").fill("definitelyWrong1");
    await field(page, "newPassword").fill("brandNewPass1");
    await field(page, "newConfirmPassword").fill("brandNewPass1");
    await page.getByRole("button", { name: "Đổi mật khẩu" }).click();

    await expect(
      page
        .locator('[data-field="currentPassword"]')
        .getByText("Current password is incorrect."),
    ).toBeVisible();
  });

  test("mismatched new passwords never reach the API", async ({ page }) => {
    let requested = false;

    page.on("request", (request) => {
      if (request.url().includes("/profile/change-password")) requested = true;
    });

    await field(page, "currentPassword").fill(CLIENT.password);
    await field(page, "newPassword").fill("brandNewPass1");
    await field(page, "newConfirmPassword").fill("somethingElse1");
    await page.getByRole("button", { name: "Đổi mật khẩu" }).click();

    await expect(page.getByText("Hai mật khẩu không khớp.")).toBeVisible();
    expect(requested).toBe(false);
  });

  test("changing the password lets the new one sign in", async ({ page }) => {
    await field(page, "currentPassword").fill(CLIENT.password);
    await field(page, "newPassword").fill("rotatedAgain1");
    await field(page, "newConfirmPassword").fill("rotatedAgain1");
    await page.getByRole("button", { name: "Đổi mật khẩu" }).click();

    await expect(page.getByText("Đã đổi mật khẩu")).toBeVisible();

    await page.request.post("/api/auth/logout");
    await signIn(page, { email: CLIENT.email, password: "rotatedAgain1" });
  });

  test("enabling 2FA hands back a secret you can store", async ({ page }) => {
    await page.getByRole("button", { name: "Bật 2FA" }).click();

    await expect(page.getByText("Đã bật xác thực hai lớp")).toBeVisible();
    await expect(page.getByText("Chuỗi bí mật: JBSWY3DPEHPK3PXP")).toBeVisible();
    await expect(
      page.getByRole("link", { name: /^otpauth:\/\/totp/ }),
    ).toBeVisible();
  });

  test("disabling 2FA needs a code, and rejects a wrong one", async ({ page }) => {
    const disable = page.getByRole("button", { name: "Tắt 2FA" });

    await expect(disable).toBeDisabled();

    await field(page, "totpCode").fill("000000");
    await disable.click();

    await expect(
      page.locator('[data-field="totpCode"]').getByText("Invalid code."),
    ).toBeVisible();

    await field(page, "totpCode").fill(TWO_FACTOR.totpCode);
    await disable.click();

    await expect(page.getByText("Đã tắt xác thực hai lớp")).toBeVisible();
  });

  test("an OTP can be mailed for the 2FA teardown", async ({ page }) => {
    await page.getByRole("button", { name: "Gửi mã" }).click();

    await expect(page.getByText("Đã gửi mã vào email của bạn.")).toBeVisible();
  });
});
