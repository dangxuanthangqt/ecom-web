import { ADMIN, CLIENT } from "../support/accounts";
import { expect, field, signIn, signOut, test } from "../support/test";

/** An order has to exist before fulfilment has anything to do. */
async function placeOrderAsShopper(page: import("@playwright/test").Page) {
  await signIn(page, CLIENT);
  await page.goto("/vi/products/product-headphones");
  await page.getByRole("button", { name: "Thêm vào giỏ" }).click();
  await expect(page.getByText("Đã thêm vào giỏ")).toBeVisible();

  await page.goto("/vi/cart");
  await page.getByRole("checkbox", { name: "Chọn tất cả" }).check();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await page.getByRole("button", { name: "Đặt hàng" }).click();
  await expect(page).toHaveURL(/\/vi\/orders\/order-/);

  await signOut(page);
}

test.describe("admin · order fulfilment", () => {
  test.beforeEach(async ({ page }) => {
    await placeOrderAsShopper(page);
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/orders");
  });

  test("lists every customer's order, not only your own", async ({ page }) => {
    await expect(page.getByRole("row", { name: /order-/ })).toHaveCount(1);
  });

  test("moving an order along sticks, and the shopper sees it", async ({ page }) => {
    await page
      .getByRole("combobox", { name: "Đổi trạng thái" })
      .selectOption("PENDING_DELIVERY");

    await expect(page.getByText("Đã đổi trạng thái đơn")).toBeVisible();

    await signIn(page, CLIENT);
    await page.goto("/vi/orders");

    await expect(page.getByRole("link", { name: /Đơn #/ })).toContainText(
      "Đang giao",
    );
  });

  test("the status filter narrows the queue", async ({ page }) => {
    await page.getByLabel("Lọc theo trạng thái").selectOption("DELIVERED");

    await expect(page.getByText("Không có dòng nào.")).toBeVisible();

    await page
      .getByLabel("Lọc theo trạng thái")
      .selectOption("PENDING_CONFIRMATION");

    await expect(page.getByRole("row", { name: /order-/ })).toHaveCount(1);
  });

  test("opening an order shows the lines it was placed with", async ({ page }) => {
    await page.getByRole("button", { name: /^order-/ }).click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Aurora Headphones")).toBeVisible();
    await expect(dialog.getByText("Black × 1")).toBeVisible();

    await dialog.getByRole("button", { name: "Đóng" }).click();
    await expect(dialog).toBeHidden();
  });
});

test.describe("admin · translations", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/translations");
  });

  test("starts on brands and can move between the three tables", async ({ page }) => {
    await expect(page.getByRole("tab", { name: "Thương hiệu" })).toHaveAttribute(
      "aria-selected",
      "true",
    );

    await page.getByRole("tab", { name: "Sản phẩm" }).click();

    await expect(page.getByRole("tab", { name: "Sản phẩm" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("creates a brand translation against a language", async ({ page }) => {
    await page.getByRole("button", { name: "Bản dịch mới" }).click();

    await field(page, "targetId").selectOption({ label: "Aurora" });
    await field(page, "languageId").selectOption("vn");
    await field(page, "name").fill("Aurora Việt Nam");
    await field(page, "description").fill("Thương hiệu âm thanh.");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu bản dịch")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Aurora Việt Nam" }),
    ).toBeVisible();
  });

  test("editing a translation keeps its target and only changes the text", async ({ page }) => {
    await page.getByRole("button", { name: "Bản dịch mới" }).click();
    await field(page, "targetId").selectOption({ label: "Nimbus" });
    await field(page, "languageId").selectOption("vn");
    await field(page, "name").fill("Nimbus VN");
    await page.getByRole("button", { name: "Lưu" }).click();
    await expect(page.getByText("Đã lưu bản dịch")).toBeVisible();

    await page
      .getByRole("row", { name: /Nimbus VN/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    // The target cannot be moved after creation, so its picker is not offered.
    await expect(field(page, "targetId")).toBeHidden();

    await field(page, "name").fill("Nimbus Việt Nam");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(
      page.getByRole("cell", { name: "Nimbus Việt Nam" }),
    ).toBeVisible();
  });
});

test.describe("admin · media", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/media");
  });

  test("uploads a single image and offers its URL", async ({ page }) => {
    await field(page, "file1").setInputFiles({
      name: "shot.png",
      mimeType: "image/png",
      buffer: Buffer.from("fake-png"),
    });
    await page.getByRole("button", { name: "Gửi" }).click();

    await expect(page.getByText("Tải lên xong")).toBeVisible();
    await expect(page.getByRole("button", { name: "Chép URL" })).toBeVisible();
  });

  test("asks the API for a presigned URL", async ({ page }) => {
    await field(page, "presign-key").fill("images/banner.png");
    await page.getByRole("button", { name: "Lấy URL" }).click();

    await expect(page.getByRole("button", { name: "Chép URL" })).toBeVisible();
  });

  test("deletes an object by key", async ({ page }) => {
    await field(page, "deleteKey").fill("images/banner.png");
    await page
      .locator("form", { has: field(page, "deleteKey") })
      .getByRole("button")
      .last()
      .click();

    await expect(page.getByText("Đã xoá object")).toBeVisible();
  });
});
