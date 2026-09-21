/** Mirrors the credentials seeded in `e2e/mock-api/fixtures.mjs`. */
export const ADMIN = {
  email: "admin@ecom.test",
  password: "adminPassword1",
  name: "Ada Admin",
};

export const CLIENT = {
  email: "shopper@ecom.test",
  password: "shopperPass1",
  name: "Chi Shopper",
};

/** Catalogue editor: brand permissions only, so most admin pages stay shut. */
export const EDITOR = {
  email: "editor@ecom.test",
  password: "editorPass1",
  name: "Ly Editor",
};

export const TWO_FACTOR = {
  email: "twofactor@ecom.test",
  password: "twoFactorPass1",
  totpCode: "123456",
  name: "Tuan TwoFactor",
};

/** The OTP the mock always issues, so specs can type it. */
export const OTP_CODE = "654321";

/**
 * Prices are formatted with `Intl`, so the expected string depends on the
 * locale the browser runs under. Recomputing it beats hardcoding "$120.00",
 * which is only right for `en`.
 */
export function money(value: number, locale = "vi") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
  }).format(value);
}
