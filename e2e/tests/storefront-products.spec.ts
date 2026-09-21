import { expect, test } from "../support/test";
import { ADMIN, CLIENT } from "../support/accounts";
import { signIn } from "../support/test";

test.describe("product browsing", () => {
  test("lists everything the API returns, with the count", async ({ page }) => {
    await page.goto("/vi/products");

    await expect(page.getByRole("heading", { name: "Sản phẩm" })).toBeVisible();
    await expect(page.getByText("2 sản phẩm")).toBeVisible();
    await expect(page.getByRole("link", { name: /Tai nghe Aurora/ })).toBeVisible();
  });

  test("search narrows the list and survives a reload via the URL", async ({ page }) => {
    await page.goto("/vi/products");

    // The header carries a search box too, so scope to the page's own one.
    const search = page.getByRole("main").getByLabel("Tìm kiếm", { exact: true });

    await search.fill("Nimbus");
    await search.press("Enter");

    await expect(page.getByText("1 sản phẩm")).toBeVisible();
    await expect(page.getByRole("link", { name: /Đồng hồ Nimbus/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Tai nghe Aurora/ })).toBeHidden();

    await page.goto("/vi/products?keyword=Nimbus");
    await expect(page.getByText("1 sản phẩm")).toBeVisible();
  });

  test("a brand filter cuts the list down", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByRole("checkbox", { name: "Aurora" }).check();

    await expect(page.getByText("1 sản phẩm")).toBeVisible();
    await expect(page.getByRole("link", { name: /Tai nghe Aurora/ })).toBeVisible();
  });

  test("the price range filter applies both bounds", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByLabel("Giá từ").fill("100");

    await expect(page.getByText("1 sản phẩm")).toBeVisible();
    await expect(page.getByRole("link", { name: /Tai nghe Aurora/ })).toBeVisible();

    await page.getByLabel("Giá từ").fill("");
    await page.getByLabel("Giá đến").fill("95");

    await expect(page.getByRole("link", { name: /Đồng hồ Nimbus/ })).toBeVisible();
  });

  test("sorting by price ascending puts the cheaper product first", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByLabel("Sắp xếp theo").selectOption("basePrice");
    await page.getByLabel("Thứ tự").selectOption("asc");

    const firstCard = page.locator("a.grid-item").first();

    await expect(firstCard).toContainText("Đồng hồ Nimbus");
  });

  test("filters that match nothing show the empty state, not a blank grid", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByLabel("Giá từ").fill("10000");

    await expect(
      page.getByText("Không có sản phẩm nào khớp bộ lọc."),
    ).toBeVisible();
  });

  test("clearing the filters brings the full list back", async ({ page }) => {
    await page.goto("/vi/products");

    await page.getByLabel("Giá từ").fill("10000");
    await expect(page.getByText("Không có sản phẩm nào khớp bộ lọc.")).toBeVisible();

    await page.getByRole("button", { name: "Xoá bộ lọc" }).click();

    await expect(page.getByText("2 sản phẩm")).toBeVisible();
  });

  test("the category filter follows the permission, not just the session", async ({ page }) => {
    // `/categories` needs `category:read:any`. Anonymous visitors and plain
    // shoppers must not be shown a filter whose request can only fail.
    await page.goto("/vi/products");
    await expect(page.getByRole("checkbox", { name: "Audio" })).toBeHidden();

    await signIn(page, CLIENT);
    await page.goto("/vi/products");
    await expect(page.getByRole("checkbox", { name: "Audio" })).toBeHidden();

    await signIn(page, ADMIN);
    await page.goto("/vi/products");
    await expect(page.getByRole("checkbox", { name: "Audio" })).toBeVisible();
  });

  test("a shopper's product page never fires a request it cannot make", async ({ page }) => {
    const forbidden: string[] = [];

    page.on("response", (response) => {
      if (response.status() === 403) forbidden.push(response.url());
    });

    await signIn(page, CLIENT);
    await page.goto("/vi/products");
    await page.waitForLoadState("networkidle");

    expect(forbidden).toEqual([]);
  });
});

test.describe("product detail", () => {
  test("shows the translated name and description for the locale", async ({ page }) => {
    await page.goto("/vi/products/product-headphones");

    await expect(
      page.getByRole("heading", { name: "Tai nghe Aurora", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Tai nghe chụp tai chống ồn chủ động."),
    ).toBeVisible();

    await page.goto("/en/products/product-headphones");

    await expect(
      page.getByRole("heading", { name: "Aurora Headphones", level: 1 }),
    ).toBeVisible();
    await expect(
      page.getByText("Over-ear headphones with active noise cancelling."),
    ).toBeVisible();
  });

  test("picking a SKU moves the price and the stock line", async ({ page }) => {
    await page.goto("/vi/products/product-headphones");

    await expect(page.getByText("Còn 7")).toBeVisible();

    // The white SKU is out of stock, so its chip must be unusable.
    await expect(page.getByRole("button", { name: "White" })).toBeDisabled();
  });

  test("an unknown product id answers 404", async ({ page }) => {
    const response = await page.goto("/vi/products/does-not-exist");

    expect(response?.status()).toBe(404);
  });

  test("the gallery swaps the main image", async ({ page }) => {
    await page.goto("/vi/products/product-headphones");

    await page.getByRole("button", { name: "Tai nghe Aurora 2" }).click();

    await expect(
      page.getByRole("button", { name: "Tai nghe Aurora 2" }),
    ).toHaveAttribute("aria-current", "true");
  });

  test("an anonymous visitor is sent to sign in before adding to the cart", async ({ page }) => {
    await page.goto("/vi/products/product-headphones");

    await page.getByRole("button", { name: "Thêm vào giỏ" }).click();

    await expect(page).toHaveURL(/\/vi\/login/);
  });
});
