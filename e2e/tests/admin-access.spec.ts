import { ADMIN, CLIENT, EDITOR } from "../support/accounts";
import { expect, signIn, test } from "../support/test";

test.describe("admin access control", () => {
  test("an anonymous visitor is bounced to sign in", async ({ page }) => {
    await page.goto("/vi/admin");

    await expect(page).toHaveURL(/\/vi\/login\?next=%2Fvi%2Fadmin/);
  });

  test("a shopper reaches the shell but is told they may not be there", async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto("/vi/admin");

    await expect(
      page.getByText("Vai trò của bạn không có quyền vào khu vực này."),
    ).toBeVisible();
  });

  test("the shopper's own menu offers no admin entry", async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto("/vi");

    await page.getByRole("button", { name: new RegExp(CLIENT.name) }).click();

    await expect(page.getByRole("menuitem", { name: "Quản trị" })).toBeHidden();
  });

  test("an admin sees every section in the sidebar", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin");

    const nav = page.getByRole("navigation", { name: "Quản trị" });

    for (const label of [
      "Bảng điều khiển",
      "Sản phẩm",
      "Thương hiệu",
      "Danh mục",
      "Bản dịch",
      "Ngôn ngữ",
      "Đơn hàng",
      "Người dùng",
      "Vai trò",
      "Quyền",
      "Tệp media",
    ]) {
      await expect(nav.getByRole("link", { name: label })).toBeVisible();
    }
  });

  test("a catalogue editor sees only what their role unlocks", async ({ page }) => {
    await signIn(page, EDITOR);
    await page.goto("/vi/admin");

    const nav = page.getByRole("navigation", { name: "Quản trị" });

    await expect(nav.getByRole("link", { name: "Thương hiệu" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Người dùng" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Vai trò" })).toBeHidden();
    await expect(nav.getByRole("link", { name: "Quyền" })).toBeHidden();
  });

  test("a page outside the editor's role refuses on its own, not just in the nav", async ({ page }) => {
    await signIn(page, EDITOR);
    await page.goto("/vi/admin/users");

    await expect(
      page.getByText("Vai trò của bạn không có quyền vào khu vực này."),
    ).toBeVisible();
  });

  test("the dashboard counts what the API reports", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin");

    await expect(
      page.getByRole("heading", { name: "Bảng điều khiển" }),
    ).toBeVisible();

    const productStat = page
      .getByRole("term")
      .filter({ hasText: "Sản phẩm" })
      .locator("xpath=..");

    await expect(productStat.getByRole("definition")).toHaveText("2");
    await expect(page.getByText("Chờ xác nhận:")).toBeVisible();
  });

  test("the shell links back to the storefront", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin");

    await page
      .getByRole("navigation", { name: "Quản trị" })
      .getByRole("link", { name: "Về cửa hàng" })
      .click();

    await expect(page).toHaveURL(/\/vi$/);
  });
});
