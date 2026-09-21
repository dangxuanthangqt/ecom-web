import { ADMIN, CLIENT } from "../support/accounts";
import { expect, signIn, test } from "../support/test";
import { expireAccessTokens } from "../support/api";

test.describe("session handling", () => {
  test("tokens never become readable by page scripts", async ({ page }) => {
    await signIn(page, CLIENT);
    await page.goto("/vi");

    const visible = await page.evaluate(() => document.cookie);

    expect(visible).not.toContain("ecom_at");
    expect(visible).not.toContain("ecom_rt");

    const cookies = await page.context().cookies();
    const access = cookies.find((cookie) => cookie.name === "ecom_at");
    const refresh = cookies.find((cookie) => cookie.name === "ecom_rt");

    expect(access?.httpOnly).toBe(true);
    expect(refresh?.httpOnly).toBe(true);
    expect(access?.sameSite).toBe("Lax");
    expect(access?.path).toBe("/");
  });

  test("the login route answers without handing the tokens back", async ({ page }) => {
    const response = await page.request.post("/api/auth/login", {
      data: { email: CLIENT.email, password: CLIENT.password },
    });

    expect(response.ok()).toBeTruthy();
    expect(await response.json()).toEqual({ ok: true });
    expect(await response.text()).not.toContain("at:");
  });

  test("the proxy refuses the endpoints that mint or spend tokens", async ({ page }) => {
    for (const path of ["auth/login", "auth/logout", "auth/refresh-token"]) {
      const response = await page.request.post(`/api/proxy/${path}`, { data: {} });

      expect(response.status(), path).toBe(404);
      expect((await response.json()).error).toBe("NOT_PROXYABLE");
    }
  });

  test("the proxy attaches the bearer the browser never sees", async ({ page }) => {
    await signIn(page, ADMIN);

    const echo = await (await page.request.get("/api/proxy/__test__/echo")).json();

    expect(echo.authorization).toMatch(/^Bearer at:user-admin:/);
    // The API must not receive the app's own cookies.
    expect(echo.cookie).toBeNull();
  });

  test("the proxy tells the API which language the page is in", async ({ page }) => {
    await page.goto("/vi");
    expect(
      (await (await page.request.get("/api/proxy/__test__/echo")).json()).xLang,
    ).toBe("vn");

    await page.goto("/en");
    expect(
      (await (await page.request.get("/api/proxy/__test__/echo")).json()).xLang,
    ).toBe("en");
  });

  test("an expired access token is refreshed and the call replayed", async ({ page }) => {
    await signIn(page, CLIENT);

    const before = (await page.context().cookies()).find(
      (cookie) => cookie.name === "ecom_at",
    )?.value;

    await expireAccessTokens();

    const response = await page.request.get("/api/proxy/profile");

    expect(response.status()).toBe(200);
    expect((await response.json()).email).toBe(CLIENT.email);

    const after = (await page.context().cookies()).find(
      (cookie) => cookie.name === "ecom_at",
    )?.value;

    expect(after).toBeTruthy();
    expect(after).not.toBe(before);
  });

  test("the refresh is invisible to the page that triggered it", async ({ page }) => {
    await signIn(page, CLIENT);
    await expireAccessTokens();

    await page.goto("/vi/account");

    await expect(
      page.getByRole("heading", { name: "Tài khoản của tôi" }),
    ).toBeVisible();
    await expect(page.getByText(CLIENT.email)).toBeVisible();
  });

  test("a dead session is cleared rather than left half alive", async ({ page }) => {
    await signIn(page, CLIENT);
    await expireAccessTokens();

    // Break the refresh token too: now nothing can be renewed.
    await page.context().addCookies([
      {
        name: "ecom_rt",
        value: "rt:nobody:gone",
        domain: "localhost",
        path: "/",
      },
    ]);

    const response = await page.request.get("/api/proxy/profile");

    expect(response.status()).toBe(401);

    const cookies = await page.context().cookies();

    expect(cookies.filter((cookie) => cookie.name.startsWith("ecom_"))).toEqual(
      [],
    );
  });

  test("guarded routes stay guarded when the cookie is dropped mid-session", async ({
    page,
    context,
  }) => {
    await signIn(page, ADMIN);
    await page.goto("/vi/admin");
    await expect(
      page.getByRole("heading", { name: "Bảng điều khiển" }),
    ).toBeVisible();

    await context.clearCookies();
    await page.goto("/vi/admin/users");

    await expect(page).toHaveURL(/\/vi\/login/);
  });
});
