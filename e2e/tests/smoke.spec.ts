import { expect, test } from "../support/test";

test.describe("routing and locales", () => {
  test("the bare root lands on the default locale", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveURL(/\/vi$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
  });

  test("the hero renders in Vietnamese", async ({ page }) => {
    await page.goto("/vi");

    await expect(
      page.getByRole("heading", { name: "Cần gì cũng có, trong một cửa hàng" }),
    ).toBeVisible();
  });

  test("the same page renders in English under /en", async ({ page }) => {
    await page.goto("/en");

    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(
      page.getByRole("heading", { name: "Everything you need, in one store" }),
    ).toBeVisible();
  });

  test("the locale switcher keeps you on the same page", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByRole("button", { name: /Ngôn ngữ: Tiếng Việt/ }).click();
    await page.getByRole("menuitem", { name: "English" }).click();

    await expect(page).toHaveURL(/\/en\/products$/);
    await expect(page.getByRole("heading", { name: "Products" })).toBeVisible();
  });

  test("the header walks to the product list", async ({ page }) => {
    await page.goto("/vi");

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Sản phẩm", exact: true })
      .click();

    await expect(page).toHaveURL(/\/vi\/products$/);
  });

  test("featured products come from the API, not from markup", async ({ page }) => {
    await page.goto("/vi");

    // Vietnamese names come from `productTranslations`, so seeing them proves
    // the translation pick ran, not just that a card rendered.
    await expect(page.getByRole("link", { name: /Tai nghe Aurora/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Đồng hồ Nimbus/ })).toBeVisible();
  });
});
