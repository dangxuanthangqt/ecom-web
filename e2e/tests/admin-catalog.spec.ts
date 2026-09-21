import { ADMIN } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";
import { readMockState } from "../support/api";

test.describe("admin · brands", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/brands");
  });

  test("lists the brands the API holds", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "Aurora" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Nimbus" })).toBeVisible();
  });

  test("creates a brand and shows it in the table", async ({ page }) => {
    await page.getByRole("button", { name: "Thương hiệu mới" }).click();

    await field(page, "name").fill("Zephyr");
    await field(page, "logo").fill("https://cdn.test/zephyr.png");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu thương hiệu")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Zephyr" })).toBeVisible();

    expect((await readMockState()).brands).toContain("Zephyr");
  });

  test("edits a brand in place", async ({ page }) => {
    await page
      .getByRole("row", { name: /Aurora/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await expect(field(page, "name")).toHaveValue("Aurora");

    await field(page, "name").fill("Aurora Audio");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByRole("cell", { name: "Aurora Audio" })).toBeVisible();
  });

  test("deleting asks first and then removes the row", async ({ page }) => {
    await page
      .getByRole("row", { name: /Nimbus/ })
      .getByRole("button", { name: "Xoá" })
      .click();

    const dialog = page.getByRole("dialog");

    await expect(dialog.getByText("Xoá thương hiệu này?")).toBeVisible();
    await dialog.getByRole("button", { name: "Xoá", exact: true }).click();

    await expect(page.getByText("Đã xoá thương hiệu")).toBeVisible();
    await expect(page.getByRole("cell", { name: "Nimbus" })).toBeHidden();
  });

  test("search filters the table", async ({ page }) => {
    await field(page, "admin-search").fill("Nimbus");

    await expect(page.getByRole("cell", { name: "Nimbus" })).toBeVisible();
    await expect(page.getByRole("cell", { name: "Aurora" })).toBeHidden();
  });
});

test.describe("admin · categories", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/categories");
  });

  test("creates a child category under a parent", async ({ page }) => {
    await page.getByRole("button", { name: "Danh mục mới" }).click();

    await field(page, "name").fill("Tai nghe");
    await field(page, "parentCategoryId").selectOption({ label: "Audio" });
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu danh mục")).toBeVisible();

    const row = page.getByRole("row", { name: /Tai nghe/ });

    await expect(row).toContainText("Audio");
  });

  test("a category cannot be made its own parent", async ({ page }) => {
    await page
      .getByRole("row", { name: /Audio/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    const options = await field(page, "parentCategoryId")
      .locator("option")
      .allInnerTexts();

    expect(options).not.toContain("Audio");
  });
});

test.describe("admin · languages", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/languages");
  });

  test("lists the seeded language codes", async ({ page }) => {
    await expect(page.getByRole("cell", { name: "en", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "vn", exact: true })).toBeVisible();
  });

  test("creates a language, code and all", async ({ page }) => {
    await page.getByRole("button", { name: "Ngôn ngữ mới" }).click();

    await field(page, "id").fill("ja");
    await field(page, "name").fill("日本語");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu ngôn ngữ")).toBeVisible();
    await expect(page.getByRole("cell", { name: "ja", exact: true })).toBeVisible();

    expect((await readMockState()).languages).toContain("ja");
  });

  test("a duplicate code comes back on the field", async ({ page }) => {
    await page.getByRole("button", { name: "Ngôn ngữ mới" }).click();

    await field(page, "id").fill("en");
    await field(page, "name").fill("English again");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(
      page.locator('[data-field="id"]').getByText("Language code already exists."),
    ).toBeVisible();
  });

  test("the code is not editable once the language exists", async ({ page }) => {
    await page
      .getByRole("row", { name: /English/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await expect(field(page, "id")).toBeHidden();
    await expect(field(page, "name")).toHaveValue("English");
  });
});
