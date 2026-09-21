import { ADMIN, CLIENT } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";
import { readMockState } from "../support/api";

test.describe("admin · users", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/users");
  });

  test("lists users with their role and status", async ({ page }) => {
    const row = page.getByRole("row", { name: new RegExp(CLIENT.name) });

    await expect(row).toContainText(CLIENT.email);
    await expect(row).toContainText("CLIENT");
    await expect(row).toContainText("ACTIVE");
  });

  test("creates a user with a role", async ({ page }) => {
    await page.getByRole("button", { name: "Người dùng mới" }).click();

    await field(page, "email").fill("fresh@ecom.test");
    await field(page, "name").fill("Fresh User");
    await field(page, "phoneNumber").fill("0911111111");
    await field(page, "password").fill("freshPass123");
    await field(page, "roleId").selectOption({ label: "CLIENT" });
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu người dùng")).toBeVisible();
    await expect(page.getByRole("cell", { name: "fresh@ecom.test" })).toBeVisible();

    const state = await readMockState();

    expect(state.users.map((user: { email: string }) => user.email)).toContain(
      "fresh@ecom.test",
    );
  });

  test("a duplicate email is reported on the field", async ({ page }) => {
    await page.getByRole("button", { name: "Người dùng mới" }).click();

    await field(page, "email").fill(CLIENT.email);
    await field(page, "name").fill("Copy Cat");
    await field(page, "phoneNumber").fill("0911111112");
    await field(page, "password").fill("copyCatPass1");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(
      page.locator('[data-field="email"]').getByText("Email already exists."),
    ).toBeVisible();
  });

  test("editing hides the email and treats the password as optional", async ({ page }) => {
    await page
      .getByRole("row", { name: new RegExp(CLIENT.name) })
      .getByRole("button", { name: "Sửa" })
      .click();

    await expect(field(page, "email")).toBeHidden();
    await expect(field(page, "name")).toHaveValue(CLIENT.name);

    await field(page, "status").selectOption("BLOCKED");
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu người dùng")).toBeVisible();
    await expect(
      page.getByRole("row", { name: new RegExp(CLIENT.name) }),
    ).toContainText("BLOCKED");
  });

  test("deleting a user removes the row", async ({ page }) => {
    await page
      .getByRole("row", { name: new RegExp(CLIENT.name) })
      .getByRole("button", { name: "Xoá" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Xoá", exact: true })
      .click();

    await expect(page.getByText("Đã xoá người dùng")).toBeVisible();
    await expect(page.getByRole("cell", { name: CLIENT.email })).toBeHidden();
  });
});

test.describe("admin · roles", () => {
  test.beforeEach(async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/roles");
  });

  test("marks system roles and refuses to delete them", async ({ page }) => {
    const adminRow = page.getByRole("row", { name: /ADMIN/ });

    await expect(adminRow).toContainText("Vai trò hệ thống");
    await expect(adminRow.getByRole("button", { name: "Xoá" })).toBeDisabled();
  });

  test("creates a role with a chosen permission set", async ({ page }) => {
    await page.getByRole("button", { name: "Vai trò mới" }).click();

    await field(page, "name").fill("SUPPORT");
    await field(page, "description").fill("Reads orders only");
    await page.getByRole("checkbox", { name: "order:read:any" }).check();
    await page.getByRole("button", { name: "Lưu" }).click();

    await expect(page.getByText("Đã lưu vai trò")).toBeVisible();
    await expect(page.getByRole("cell", { name: "SUPPORT" })).toBeVisible();
  });

  test("the edit dialog pre-ticks the role's current permissions", async ({ page }) => {
    await page
      .getByRole("row", { name: /CATALOG_EDITOR/ })
      .getByRole("button", { name: "Sửa" })
      .click();

    await expect(
      page.getByRole("checkbox", { name: "brand:read:any" }),
    ).toBeChecked();
    await expect(
      page.getByRole("checkbox", { name: "user:read:any" }),
    ).not.toBeChecked();
  });

  test("a non-system role can be deleted", async ({ page }) => {
    await page
      .getByRole("row", { name: /CATALOG_EDITOR/ })
      .getByRole("button", { name: "Xoá" })
      .click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Xoá", exact: true })
      .click();

    await expect(page.getByText("Đã xoá vai trò")).toBeVisible();
  });
});

test.describe("admin · permissions", () => {
  test("are read-only and say so", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/permissions");

    await expect(
      page.getByText("Quyền do API seed sẵn, ở đây chỉ xem."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Sửa" })).toHaveCount(0);
    await expect(page.getByRole("cell", { name: "brand:create:any" })).toBeVisible();
  });

  test("search narrows by resource", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/permissions");

    await field(page, "admin-search").fill("role:");

    await expect(page.getByRole("cell", { name: "role:create:any" })).toBeVisible();
    await expect(
      page.getByRole("cell", { name: "brand:create:any" }),
    ).toBeHidden();
  });

  test("shows which roles hold a permission", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin/permissions");

    await field(page, "admin-search").fill("user:read:any");

    await expect(
      page.getByRole("row", { name: /user:read:any/ }),
    ).toContainText("ADMIN");
  });
});
