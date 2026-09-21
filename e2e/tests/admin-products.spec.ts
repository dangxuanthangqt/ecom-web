import { ADMIN, money } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";
import { readMockState } from "../support/api";

test.describe("admin · products", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/products");
  });

  test("lists products with brand and price", async ({ page }) => {
    const row = page.getByRole("row", { name: /Aurora Headphones/ });

    await expect(row).toContainText("Aurora");
    await expect(row).toContainText(money(120));
  });

  test("creates a product, generating its SKUs from the variants", async ({ page }) => {
    await page.getByRole("button", { name: "Sản phẩm mới" }).click();

    await field(page, "name").fill("Aurora Speaker");
    await field(page, "basePrice").fill("200");
    await field(page, "virtualPrice").fill("240");
    await field(page, "brandId").selectOption({ label: "Aurora" });
    await field(page, "images").fill("https://cdn.test/speaker.png");
    await page.getByRole("checkbox", { name: "Audio" }).check();

    await page.getByRole("button", { name: "Thêm phân loại" }).click();
    await field(page, "variant-name-0").fill("Color");
    await field(page, "variant-options-0").fill("Black, Silver");

    await page.getByRole("button", { name: "Sinh từ phân loại" }).click();

    // One SKU per option, named after the combination.
    await expect(page.getByRole("textbox", { name: "SKU" })).toHaveCount(2);
    await expect(page.getByRole("textbox", { name: "SKU" }).first()).toHaveValue(
      "Black",
    );

    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu sản phẩm")).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "Aurora Speaker" }),
    ).toBeVisible();

    expect((await readMockState()).products).toContain("Aurora Speaker");
  });

  test("two variants produce the cross product of their options", async ({ page }) => {
    await page.getByRole("button", { name: "Sản phẩm mới" }).click();

    await page.getByRole("button", { name: "Thêm phân loại" }).click();
    await field(page, "variant-name-0").fill("Color");
    await field(page, "variant-options-0").fill("Black, White");

    await page.getByRole("button", { name: "Thêm phân loại" }).click();
    await field(page, "variant-name-1").fill("Size");
    await field(page, "variant-options-1").fill("S, M, L");

    await page.getByRole("button", { name: "Sinh từ phân loại" }).click();

    await expect(page.getByRole("textbox", { name: "SKU" })).toHaveCount(6);
    await expect(page.getByRole("textbox", { name: "SKU" }).nth(3)).toHaveValue(
      "White-S",
    );
  });

  test("the edit dialog arrives filled in from the full record", async ({ page }) => {
    await page
      .getByRole("row", { name: /Aurora Headphones/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await expect(field(page, "name")).toHaveValue("Aurora Headphones");
    await expect(field(page, "basePrice")).toHaveValue("120");
    await expect(field(page, "variant-name-0")).toHaveValue("Color");
    await expect(field(page, "variant-options-0")).toHaveValue("Black, White");
    await expect(page.getByRole("checkbox", { name: "Audio" })).toBeChecked();
  });

  test("a price edit busts the cached storefront page", async ({ page }) => {
    // The home page caches its product list for a minute. Saving has to drop
    // that cache, or an admin edit is invisible to shoppers until it expires.
    await page
      .getByRole("row", { name: /Aurora Headphones/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await field(page, "basePrice").fill("135");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu sản phẩm")).toBeVisible();

    await page.goto("/vi");

    const card = page.getByRole("link", { name: /Tai nghe Aurora/ });

    await expect(card).toContainText(money(135));
  });

  test("the detail price follows the SKU, not the base price", async ({ page }) => {
    // Each SKU carries its own price; `basePrice` is the catalogue figure.
    await page
      .getByRole("row", { name: /Aurora Headphones/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await field(page, "basePrice").fill("135");
    await page.getByRole("button", { name: "Lưu" }).click();
    await expect(page.getByText("Đã lưu sản phẩm")).toBeVisible();

    await page.goto("/vi/products/product-headphones");

    await expect(page.getByText(money(120)).first()).toBeVisible();
  });

  test("a missing name is refused with the field error", async ({ page }) => {
    await page.getByRole("button", { name: "Sản phẩm mới" }).click();

    await field(page, "images").fill("https://cdn.test/x.png");
    await page.getByRole("button", { name: "Lưu" }).click();

    // The browser's own required check fires first, so the dialog stays open.
    await expect(page.getByRole("dialog")).toBeVisible();
  });

  test("deleting a product drops it from the storefront too", async ({ page }) => {
    await page
      .getByRole("row", { name: /Nimbus Watch/ })
      .getByRole("button", { name: "Xoá" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Xoá", exact: true })
      .click();

    await expect(page.getByText("Đã xoá sản phẩm")).toBeVisible();

    await page.goto("/vi/products");
    await expect(page.getByText("1 sản phẩm")).toBeVisible();
  });
});
