import { ADMIN, CLIENT } from "../support/accounts";
import { expect, field, signIn, test } from "../support/test";

const PRODUCT = "/vi/products/product-headphones";

test.describe("reviews", () => {
  test("anonymous visitors read reviews but are asked to sign in to write", async ({ page }) => {
    await page.goto(PRODUCT);

    await expect(page.getByRole("heading", { name: "Đánh giá" })).toBeVisible();
    await expect(page.getByText("Âm thanh rất tốt.")).toBeVisible();
    await expect(page.getByText("Chi Shopper")).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Đăng nhập để đánh giá." }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Đăng đánh giá" })).toBeHidden();
  });

  test("a signed-in shopper can post a review and see it immediately", async ({ page }) => {
    await signIn(page, ADMIN);
    await page.goto(PRODUCT);

    await field(page, "review-rating").selectOption("4");
    await field(page, "review-content").fill("Pin trâu, đeo êm.");
    await page.getByRole("button", { name: "Đăng đánh giá" }).click();

    await expect(page.getByText("Cảm ơn đánh giá của bạn")).toBeVisible();
    await expect(page.getByText("Pin trâu, đeo êm.")).toBeVisible();
    await expect(page.getByText("2 đánh giá")).toBeVisible();
  });

  test("an empty review is refused by the form, not by the server", async ({ page }) => {
    let posted = false;

    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        request.url().includes("/api/proxy/reviews")
      ) {
        posted = true;
      }
    });

    await signIn(page, ADMIN);
    await page.goto(PRODUCT);

    await page.getByRole("button", { name: "Đăng đánh giá" }).click();

    expect(posted).toBe(false);
  });

  test("you may edit and delete your own review, but not someone else's", async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto(PRODUCT);

    const mine = page.locator("li", { hasText: "Âm thanh rất tốt." }).last();

    await mine.getByRole("button", { name: "Sửa" }).click();
    await field(page, "review-content").fill("Nghe lâu vẫn thoải mái.");
    await page.getByRole("button", { name: "Đăng đánh giá" }).click();

    await expect(page.getByText("Nghe lâu vẫn thoải mái.")).toBeVisible();

    await page.getByRole("button", { name: "Xoá" }).first().click();
    await page
      .getByRole("dialog")
      .getByRole("button", { name: "Xoá", exact: true })
      .click();

    await expect(page.getByText("Đã xoá đánh giá")).toBeVisible();
    await expect(page.getByText("Chưa có đánh giá")).toBeVisible();
  });

  test("another shopper's review offers no edit or delete", async ({ page }) => {
    // The seeded review belongs to the shopper, so the admin must not own it.
    await signIn(page, ADMIN);
    await page.goto(PRODUCT);

    const theirs = page.locator("li", { hasText: "Âm thanh rất tốt." }).last();

    await expect(theirs.getByRole("button", { name: "Sửa" })).toBeHidden();
    await expect(theirs.getByRole("button", { name: "Xoá" })).toBeHidden();
  });
});
