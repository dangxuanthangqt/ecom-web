import { CLIENT, money } from "../support/accounts";
import { expect, signIn, test } from "../support/test";
import { withMockApi } from "../support/api";

/** Puts an order in the world without walking the whole buy flow again. */
async function placeOrder(page: import("@playwright/test").Page) {
  await page.goto("/vi/products/product-headphones");
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page.getByText("Đã thêm vào giỏ")).toBeVisible();

  await page.goto("/vi/cart");
  await page.getByRole("checkbox", { name: "Chọn tất cả" }).check();
  await page.getByRole("button", { name: "Đặt hàng" }).click();

  // Cart and checkout label their button the same, so wait for the page to
  // actually change before clicking again — otherwise the second click can
  // land back on the cart's button and the order never gets placed.
  await expect(page).toHaveURL(/\/vi\/checkout\?ids=/);
  await expect(page.getByRole("heading", { name: "Tóm tắt đơn" })).toBeVisible();

  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page).toHaveURL(/\/vi\/orders\/order-/);

  return page.url().split("/").pop() as string;
}

test.describe("my orders", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, CLIENT);
  });

  test("an account with no orders says so", async ({ page }) => {
    await page.goto("/vi/orders");

    await expect(page.getByText("Bạn chưa đặt đơn nào.")).toBeVisible();
  });

  test("a placed order appears in the list with its status", async ({ page }) => {
    await placeOrder(page);
    await page.goto("/vi/orders");

    const row = page.getByRole("link", { name: /Đơn #/ });

    await expect(row).toBeVisible();
    await expect(row).toContainText("Chờ xác nhận");
  });

  test("the status filter narrows the list", async ({ page }) => {
    await placeOrder(page);
    await page.goto("/vi/orders");

    await page.getByLabel("Trạng thái").selectOption("DELIVERED");
    await expect(page.getByText("Bạn chưa đặt đơn nào.")).toBeVisible();

    await page.getByLabel("Trạng thái").selectOption("PENDING_CONFIRMATION");
    await expect(page.getByRole("link", { name: /Đơn #/ })).toBeVisible();
  });

  test("the detail page totals the lines it shows", async ({ page }) => {
    await placeOrder(page);

    await expect(
      page.getByRole("heading", { name: /Chi tiết đơn #/ }),
    ).toBeVisible();
    await expect(page.getByText("Aurora Headphones")).toBeVisible();
    await expect(page.getByText(money(120)).first()).toBeVisible();
  });

  test("cancelling asks first, then sticks", async ({ page }) => {
    await placeOrder(page);

    await page.getByRole("button", { name: "Huỷ đơn" }).click();

    const dialog = page.getByRole("dialog");

    await expect(
      dialog.getByText("Huỷ đơn này? Không hoàn tác được."),
    ).toBeVisible();

    await dialog.getByRole("button", { name: "Huỷ đơn" }).click();

    await expect(page.getByText("Đã huỷ đơn")).toBeVisible();
    await expect(page.getByText("Đã huỷ", { exact: true })).toBeVisible();
  });

  test("backing out of the confirm leaves the order alone", async ({ page }) => {
    const orderId = await placeOrder(page);

    await page.getByRole("button", { name: "Huỷ đơn" }).click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Huỷ", exact: true })
      .click();

    await expect(page.getByRole("dialog")).toBeHidden();

    const status = await withMockApi(async (api) => {
      const state = await (await api.get("/__test__/state")).json();

      return state.orders.find(
        (order: { id: string; status: string }) => order.id === orderId,
      )?.status;
    });

    expect(status).toBe("PENDING_CONFIRMATION");
  });

  test("a delivered order offers no cancel button", async ({ page }) => {
    const orderId = await placeOrder(page);

    await page.request.post("/api/proxy/does-not-matter").catch(() => undefined);
    await withMockApi((api) =>
      api.put(`/manage-order/orders/${orderId}/status`, {
        data: { status: "DELIVERED" },
        headers: { authorization: "Bearer at:user-admin:seeded" },
      }),
    );

    await page.reload();

    await expect(page.getByRole("button", { name: "Huỷ đơn" })).toBeHidden();
  });
});
