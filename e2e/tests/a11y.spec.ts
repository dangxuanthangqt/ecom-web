import AxeBuilder from "@axe-core/playwright";

import { ADMIN, CLIENT } from "../support/accounts";
import { expect, signIn, test } from "../support/test";

/**
 * WCAG 2.1 A + AA, which is the bar the design system's checklist sets.
 * Colour-contrast is included: the palette was chosen for it, so a regression
 * there should fail rather than be argued about.
 */
const scan = (page: import("@playwright/test").Page) =>
  new AxeBuilder({ page }).withTags([
    "wcag2a",
    "wcag2aa",
    "wcag21a",
    "wcag21aa",
  ]);

const publicPages = [
  ["home", "/vi"],
  ["product list", "/vi/products"],
  ["product detail", "/vi/products/product-headphones"],
  ["sign in", "/vi/login"],
  ["register", "/vi/register"],
  ["forgot password", "/vi/forgot-password"],
] as const;

for (const [name, path] of publicPages) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const { violations } = await scan(page).analyze();

    expect(
      violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target).slice(0, 3),
      })),
    ).toEqual([]);
  });
}

const signedInPages = [
  ["cart", "/vi/cart", CLIENT],
  ["orders", "/vi/orders", CLIENT],
  ["account", "/vi/account", CLIENT],
  ["admin dashboard", "/vi/admin", ADMIN],
  ["admin products", "/vi/admin/products", ADMIN],
  ["admin users", "/vi/admin/users", ADMIN],
] as const;

for (const [name, path, account] of signedInPages) {
  test(`${name} has no accessibility violations`, async ({ page }) => {
    await signIn(page, account);
    await page.goto(path);
    await page.waitForLoadState("networkidle");

    const { violations } = await scan(page).analyze();

    expect(
      violations.map((violation) => ({
        id: violation.id,
        nodes: violation.nodes.map((node) => node.target).slice(0, 3),
      })),
    ).toEqual([]);
  });
}

test("every form control on the sign-in page is wired to a label", async ({ page }) => {
  await page.goto("/vi/login");

  const unlabelled = await page.evaluate(() =>
    Array.from(
      document.querySelectorAll<HTMLElement>("input, select, textarea"),
    )
      .filter((control) => control.getAttribute("type") !== "hidden")
      .filter((control) => {
        const id = control.getAttribute("id");
        const labelled =
          (id && document.querySelector(`label[for="${id}"]`)) ||
          control.getAttribute("aria-label") ||
          control.getAttribute("aria-labelledby") ||
          control.closest("label");

        return !labelled;
      })
      .map((control) => control.outerHTML.slice(0, 120)),
  );

  expect(unlabelled).toEqual([]);
});

test("the keyboard can reach and operate the primary call to action", async ({ page }) => {
  await page.goto("/vi");

  const cta = page.getByRole("link", { name: "Mua ngay" }).first();

  await cta.focus();
  await expect(cta).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/vi\/products$/);
});

test("a dialog takes focus and gives it back on escape", async ({ page }) => {
  await signIn(page, ADMIN);
  await page.goto("/vi/admin/brands");

  await page.getByRole("button", { name: "Thương hiệu mới" }).click();

  const dialog = page.getByRole("dialog");

  await expect(dialog).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(dialog).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Thương hiệu mới" }),
  ).toBeFocused();
});

test("motion is dropped when the visitor asks for less of it", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/vi");

  const duration = await page.evaluate(() => {
    const element = document.querySelector("a.grid-item");

    return element ? getComputedStyle(element).transitionDuration : null;
  });

  // Chrome reports this as "1e-05s"; what matters is that it is effectively zero.
  expect(Number.parseFloat(duration ?? "1")).toBeLessThan(0.001);
});
