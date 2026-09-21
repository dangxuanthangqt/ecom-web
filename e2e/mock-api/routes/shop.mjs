import {
  authed,
  json,
  notFound,
  page,
  readJson,
  timestamps,
  uid,
  validationFailed,
} from "../helpers.mjs";

import { cartItemView, findSku } from "./shop-data.mjs";

/** Profile and cart: what a signed-in shopper touches before checkout. */
export const shopRoutes = [

  {
    method: "GET",
    path: "/profile",
    handler: authed(({ res, user }) =>
      json(res, 200, {
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        avatar: user.avatar,
        status: user.status,
        role: user.role,
      }),
    ),
  },
  {
    method: "PUT",
    path: "/profile",
    handler: authed(async ({ req, res, user }) => {
      const body = await readJson(req);

      if (body.name !== undefined && String(body.name).trim() === "") {
        return validationFailed(res, [
          { field: "name", code: "isNotEmpty", message: "Name is required." },
        ]);
      }

      Object.assign(user, {
        name: body.name ?? user.name,
        phoneNumber: body.phoneNumber ?? user.phoneNumber,
        avatar: body.avatar ?? user.avatar,
      });

      return json(res, 200, { ...user, password: undefined });
    }),
  },
  {
    method: "PUT",
    path: "/profile/change-password",
    handler: authed(async ({ req, res, user }) => {
      const body = await readJson(req);

      if (body.currentPassword !== user.password) {
        return validationFailed(res, [
          {
            field: "currentPassword",
            code: "isValid",
            message: "Current password is incorrect.",
          },
        ]);
      }

      user.password = body.newPassword;

      return json(res, 200, { message: "Password changed." });
    }),
  },
  {
    method: "GET",
    path: "/cart",
    handler: authed(({ state, res, query, user }) => {
      const rows = state.cartItems
        .filter((item) => item.userId === user.id)
        .map((item) => cartItemView(state, item));

      return page(res, rows, query);
    }, "cart:read:own"),
  },
  {
    method: "POST",
    path: "/cart",
    handler: authed(async ({ state, req, res, user }) => {
      const body = await readJson(req);
      const found = findSku(state, body.skuId);

      if (!found) return notFound(res, "SKU not found.");

      if (found.sku.stock < body.quantity) {
        return validationFailed(res, [
          { field: "quantity", code: "max", message: "Not enough stock." },
        ]);
      }

      const existing = state.cartItems.find(
        (item) => item.userId === user.id && item.skuId === body.skuId,
      );

      if (existing) {
        existing.quantity += body.quantity;

        return json(res, 200, cartItemView(state, existing));
      }

      const item = {
        id: uid("cart"),
        userId: user.id,
        skuId: body.skuId,
        quantity: body.quantity,
        ...timestamps(),
      };

      state.cartItems.push(item);

      return json(res, 201, cartItemView(state, item));
    }, "cart:update:own"),
  },
  {
    method: "PUT",
    path: "/cart/:id",
    handler: authed(async ({ state, req, res, params, user }) => {
      const item = state.cartItems.find(
        (row) => row.id === params.id && row.userId === user.id,
      );

      if (!item) return notFound(res, "Cart item not found.");

      item.quantity = (await readJson(req)).quantity;

      return json(res, 200, cartItemView(state, item));
    }, "cart:update:own"),
  },
  {
    method: "DELETE",
    path: "/cart/:id",
    handler: authed(({ state, res, params, user }) => {
      const index = state.cartItems.findIndex(
        (row) => row.id === params.id && row.userId === user.id,
      );

      if (index < 0) return notFound(res, "Cart item not found.");

      state.cartItems.splice(index, 1);

      return json(res, 200, { message: "Removed." });
    }, "cart:update:own"),
  },
];
