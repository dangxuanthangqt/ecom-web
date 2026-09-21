import { CLIENT } from "../support/accounts";
import { expect, signIn, test } from "../support/test";

/** Runs on the `mobile` project (Pixel 7), per `playwright.config.ts`. */
test.describe("on a phone", () => {
  test("no page scrolls sideways", async ({ page }) => {
    for (const path of [
      "/vi",
      "/vi/products",
      "/vi/products/product-headphones",
      "/vi/login",
    ]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");

      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );

      expect(overflow, path).toBeLessThanOrEqual(0);
    }
  });

  test("the navigation collapses into a drawer that works", async ({ page }) => {
    await page.goto("/vi");

    await page.getByRole("button", { name: "Mở menu" }).click();

    const drawer = page.getByRole("dialog");

    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "Sản phẩm" }).click();

    await expect(page).toHaveURL(/\/vi\/products$/);
  });

  test("the filter panel is collapsed until asked for", async ({ page }) => {
    await page.goto("/vi/products");

    await expect(page.getByRole("checkbox", { name: "Aurora" })).toBeHidden();

    await page.getByRole("button", { name: "Bộ lọc" }).click();

    await expect(page.getByRole("checkbox", { name: "Aurora" })).toBeVisible();
  });

  test("interactive controls clear the WCAG 2.2 minimum target size", async ({ page }) => {
    await page.goto("/vi");

    const targets = page.getByRole("banner").getByRole("button");
    const count = await targets.count();

    for (let index = 0; index < count; index += 1) {
      const box = await targets.nth(index).boundingBox();

      if (!box) continue;

      // 2.5.8 Target Size (Minimum), AA: 24×24 CSS pixels.
      expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(24);
    }
  });

  test("the primary call to action is a comfortable 44px tall", async ({ page }) => {
    await page.goto("/vi");

    const box = await page
      .getByRole("link", { name: "Mua ngay" })
      .first()
      .boundingBox();

    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });

  test("the cart is usable one-handed", async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto("/vi/products/product-headphones");
    await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
    await expect(page.getByText("Đã thêm vào giỏ")).toBeVisible();

    await page.goto("/vi/cart");

    await expect(page.getByRole("heading", { name: "Giỏ hàng" })).toBeVisible();
    await page.getByRole("checkbox", { name: "Chọn tất cả" }).check();
    await expect(page.getByRole("button", { name: "Đặt hàng" })).toBeEnabled();
  });

  test("the admin sidebar becomes a scrollable strip, not a lost menu", async ({ page }) => {
    await signIn(page, { email: "admin@ecom.test", password: "adminPassword1" });
    await page.goto("/vi/admin");

    const nav = page.getByRole("navigation", { name: "Quản trị" });

    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link", { name: "Người dùng" })).toBeAttached();
  });
});
