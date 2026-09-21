import {
  authed,
  fail,
  json,
  notFound,
  readJson,
  timestamps,
  uid,
  unauthorized,
  validationFailed,
} from "../helpers.mjs";

const issueTokens = (state, user) => {
  const accessToken = `at:${user.id}:${uid("n")}`;
  const refreshToken = `rt:${user.id}:${uid("r")}`;

  state.sessions.set(refreshToken, user.id);
  state.issuedAccessTokens.add(accessToken);

  return { accessToken, refreshToken };
};

export const authRoutes = [
  {
    method: "POST",
    path: "/auth/login",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);
      const user = state.users.find((item) => item.email === body.email);

      if (!body.email || !body.password) {
        return validationFailed(res, [
          ...(body.email ? [] : [{ field: "email", code: "isNotEmpty", message: "Email is required." }]),
          ...(body.password ? [] : [{ field: "password", code: "isNotEmpty", message: "Password is required." }]),
        ]);
      }

      if (String(body.password).length < 8) {
        return validationFailed(res, [
          { field: "password", code: "isLength", message: "Password must be between 8 and 20 characters." },
        ]);
      }

      if (!user || user.password !== body.password) {
        return fail(res, 401, "INVALID_CREDENTIALS", "Email or password is incorrect.");
      }

      if (user.twoFactorEnabled && !body.totpCode && !body.code) {
        return fail(res, 401, "TOTP_REQUIRED", "Two-factor code is required.");
      }

      if (user.twoFactorEnabled && body.totpCode && body.totpCode !== "123456") {
        return validationFailed(res, [
          { field: "totpCode", code: "isValid", message: "Invalid authenticator code." },
        ]);
      }

      return json(res, 200, issueTokens(state, user));
    },
  },
  {
    method: "POST",
    path: "/auth/refresh-token",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);
      const userId = state.sessions.get(body.refreshToken);

      if (!userId) return unauthorized(res, "Refresh token is invalid.");

      state.sessions.delete(body.refreshToken);

      const user = state.users.find((item) => item.id === userId);

      return json(res, 200, issueTokens(state, user));
    },
  },
  {
    method: "POST",
    path: "/auth/logout",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);

      state.sessions.delete(body.refreshToken);

      return json(res, 200, { message: "Logged out." });
    },
  },
  {
    method: "POST",
    path: "/auth/register",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);
      const details = [];

      if (state.users.some((item) => item.email === body.email)) {
        details.push({ field: "email", code: "isUnique", message: "Email already exists." });
      }

      if (state.otpCodes.get(`REGISTER:${body.email}`) !== body.code) {
        details.push({ field: "code", code: "isValid", message: "OTP code is invalid." });
      }

      if (details.length > 0) return validationFailed(res, details);

      const clientRole = state.roles.find((role) => role.name === "CLIENT");
      const user = {
        id: uid("user"),
        email: body.email,
        password: body.password,
        name: body.name,
        phoneNumber: body.phoneNumber,
        avatar: body.avatar ?? null,
        status: "ACTIVE",
        role: clientRole,
        twoFactorEnabled: false,
      };

      state.users.push(user);

      return json(res, 200, {
        id: user.id,
        email: user.email,
        name: user.name,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        status: user.status,
        ...timestamps(),
      });
    },
  },
  {
    method: "POST",
    path: "/auth/otp",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);

      if (!body.email) {
        return validationFailed(res, [
          { field: "email", code: "isNotEmpty", message: "Email is required." },
        ]);
      }

      // Fixed code so specs can type it; the real API mails a random one.
      state.otpCodes.set(`${body.type}:${body.email}`, "654321");

      return json(res, 200, { message: "OTP sent." });
    },
  },
  {
    method: "POST",
    path: "/auth/forgot-password",
    handler: async ({ state, req, res }) => {
      const body = await readJson(req);
      const user = state.users.find((item) => item.email === body.email);

      if (!user) return notFound(res, "User not found.");

      if (state.otpCodes.get(`FORGOT_PASSWORD:${body.email}`) !== body.code) {
        return validationFailed(res, [
          { field: "code", code: "isValid", message: "OTP code is invalid." },
        ]);
      }

      user.password = body.password;

      return json(res, 200, { message: "Password updated." });
    },
  },
  {
    method: "GET",
    path: "/auth/google/authorization-url",
    handler: ({ res, baseUrl }) =>
      json(res, 200, { url: `${baseUrl}/__test__/google-consent` }),
  },
  {
    method: "POST",
    path: "/auth/2fa/enable",
    handler: authed(({ res, user }) => {
      user.twoFactorEnabled = true;

      return json(res, 200, {
        secret: "JBSWY3DPEHPK3PXP",
        uri: `otpauth://totp/Ecom:${user.email}?secret=JBSWY3DPEHPK3PXP&issuer=Ecom`,
      });
    }),
  },
  {
    method: "POST",
    path: "/auth/2fa/disable",
    handler: authed(async ({ req, res, user }) => {
      const body = await readJson(req);

      if (body.totpCode !== "123456" && body.code !== "654321") {
        return validationFailed(res, [
          { field: "totpCode", code: "isValid", message: "Invalid code." },
        ]);
      }

      user.twoFactorEnabled = false;

      return json(res, 200, { message: "2FA has been disabled." });
    }),
  },
];
