import { CLIENT, money } from "../support/accounts";
import { expect, signIn, test } from "../support/test";
import { readMockState } from "../support/api";

const addHeadphonesToCart = async (page: import("@playwright/test").Page) => {
  await page.goto("/vi/products/product-headphones");
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page.getByText("Đã thêm vào giỏ")).toBeVisible();
};

test.describe("cart", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, CLIENT);
  });

  test("an empty cart offers a way out instead of a blank page", async ({ page }) => {
    await page.goto("/vi/cart");

    await expect(page.getByText("Giỏ hàng đang trống.")).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Xem sản phẩm" }),
    ).toBeVisible();
  });

  test("adding a product shows up in the cart and on the header badge", async ({ page }) => {
    await addHeadphonesToCart(page);

    await page.goto("/vi/cart");

    await expect(page.getByRole("heading", { name: "Giỏ hàng" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Aurora Headphones" })).toBeVisible();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Giỏ hàng: 1" }),
    ).toBeVisible();
  });

  test("quantity moves both ways and stops at the stock ceiling", async ({ page }) => {
    await addHeadphonesToCart(page);
    await page.goto("/vi/cart");

    await page.getByRole("button", { name: "+", exact: true }).click();
    await expect(page.getByText("2", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "-", exact: true }).click();
    await expect(page.getByText("1", { exact: true })).toBeVisible();

    // One unit in the cart, seven in stock — the decrement must be blocked at 1.
    await expect(page.getByRole("button", { name: "-", exact: true })).toBeDisabled();
  });

  test("removing the last line empties the cart", async ({ page }) => {
    await addHeadphonesToCart(page);
    await page.goto("/vi/cart");

    await page.getByRole("button", { name: "Xoá" }).click();

    await expect(page.getByText("Đã xoá khỏi giỏ")).toBeVisible();
    await expect(page.getByText("Giỏ hàng đang trống.")).toBeVisible();
  });

  test("checkout stays disabled until something is selected", async ({ page }) => {
    await addHeadphonesToCart(page);
    await page.goto("/vi/cart");

    const checkout = page.getByRole("button", { name: "Đặt hàng" });

    await expect(checkout).toBeDisabled();

    await page.getByRole("checkbox", { name: "Chọn tất cả" }).check();

    await expect(page.getByText("Đã chọn 1")).toBeVisible();
    await expect(checkout).toBeEnabled();
  });
});

test.describe("checkout", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, CLIENT);
  });

  test("turns the selected lines into an order", async ({ page }) => {
    await addHeadphonesToCart(page);
    await page.goto("/vi/cart");

    await page.getByRole("checkbox", { name: "Chọn tất cả" }).check();
    await page.getByRole("button", { name: "Đặt hàng" }).click();

    await expect(page).toHaveURL(/\/vi\/checkout\?ids=/);
    await expect(page.getByRole("heading", { name: "Tóm tắt đơn" })).toBeVisible();
    await expect(page.getByText(money(120)).first()).toBeVisible();

    await page.getByRole("button", { name: "Đặt hàng" }).click();

    await expect(page.getByText("Đã đặt hàng")).toBeVisible();
    await expect(page).toHaveURL(/\/vi\/orders\/order-/);

    const state = await readMockState();

    expect(state.orders).toHaveLength(1);
    expect(state.cartItems).toBe(0);
  });

  test("checkout with no ids explains itself", async ({ page }) => {
    await page.goto("/vi/checkout");

    await expect(
      page.getByText("Chọn ít nhất một món trong giỏ đã."),
    ).toBeVisible();
    await expect(
      page.getByRole("main").getByRole("link", { name: "Giỏ hàng" }),
    ).toBeVisible();
  });

  test("an anonymous visitor cannot reach the cart at all", async ({ page, context }) => {
    await context.clearCookies();
    await page.goto("/vi/cart");

    await expect(page).toHaveURL(/\/vi\/login\?next=%2Fvi%2Fcart/);
  });
});
