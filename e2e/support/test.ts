import { test as base, expect, type Page } from "@playwright/test";

import { resetMockApi } from "./api";

type Credentials = { email: string; password: string; totpCode?: string };

/**
 * Signs in through the app's own cookie route rather than the login form, so
 * specs that are not about authentication do not re-test it on every run. The
 * request shares the page's cookie jar, so the session lands where the browser
 * will use it.
 */
export async function signIn(page: Page, credentials: Credentials) {
  const response = await page.request.post("/api/auth/login", {
    data: {
      email: credentials.email,
      password: credentials.password,
      totpCode: credentials.totpCode,
    },
  });

  expect(
    response.ok(),
    `sign-in failed: ${response.status()} ${await response.text()}`,
  ).toBeTruthy();
}

export async function signOut(page: Page) {
  await page.request.post("/api/auth/logout");
}

/**
 * Form controls are addressed by id. `getByLabel` matches a label's raw text,
 * and the required marker (`*`, aria-hidden) rides along in it, so label text
 * makes a brittle selector. That the label is actually wired to the control is
 * asserted once and properly in `a11y.spec.ts`.
 */
export const field = (page: Page, id: string) => page.locator(`#${id}`);

/** Every test starts from the same world. */
export const test = base.extend({
  page: async ({ page }, use) => {
    await resetMockApi();
    await use(page);
  },
});

export { expect };
