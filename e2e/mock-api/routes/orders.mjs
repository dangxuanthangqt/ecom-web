import {
  authed,
  json,
  notFound,
  page,
  readJson,
  sortRows,
  timestamps,
  uid,
  validationFailed,
} from "../helpers.mjs";

import { findSku } from "./shop-data.mjs";

/** Orders and reviews: what happens after the cart. */
export const orderRoutes = [
  {
    method: "GET",
    path: "/orders",
    handler: authed(({ state, res, query, user }) => {
      const status = query.get("status");
      let rows = state.orders.filter((order) => order.userId === user.id);

      if (status) rows = rows.filter((order) => order.status === status);

      return page(
        res,
        sortRows(rows, query.get("orderBy"), query.get("order")).map(
          ({ userId: _userId, items: _items, ...order }) => order,
        ),
        query,
      );
    }, "order:read:own"),
  },
  {
    method: "POST",
    path: "/orders",
    handler: authed(async ({ state, req, res, user }) => {
      const body = await readJson(req);
      const chosen = state.cartItems.filter(
        (item) => item.userId === user.id && body.cartItemIds.includes(item.id),
      );

      if (chosen.length === 0) {
        return validationFailed(res, [
          { field: "cartItemIds", code: "isNotEmpty", message: "No cart item selected." },
        ]);
      }

      const order = {
        id: uid("order"),
        userId: user.id,
        status: "PENDING_CONFIRMATION",
        ...timestamps(),
        items: chosen.map((item) => {
          const found = findSku(state, item.skuId);

          return {
            id: uid("item"),
            productName: found.product.name,
            price: found.sku.price,
            images: found.product.images,
            skuValue: found.sku.value,
            quantity: item.quantity,
          };
        }),
      };

      state.orders.push(order);
      state.cartItems = state.cartItems.filter((item) => !chosen.includes(item));

      return json(res, 201, { ...order, userId: undefined });
    }, "order:create:own"),
  },
  {
    method: "GET",
    path: "/orders/:id",
    handler: authed(({ state, res, params, user }) => {
      const order = state.orders.find(
        (row) => row.id === params.id && row.userId === user.id,
      );

      return order
        ? json(res, 200, { ...order, userId: undefined })
        : notFound(res, "Order not found.");
    }, "order:read:own"),
  },
  {
    method: "PUT",
    path: "/orders/:id/cancel",
    handler: authed(({ state, res, params, user }) => {
      const order = state.orders.find(
        (row) => row.id === params.id && row.userId === user.id,
      );

      if (!order) return notFound(res, "Order not found.");

      order.status = "CANCELLED";

      return json(res, 200, { ...order, userId: undefined });
    }, "order:cancel:own"),
  },
  {
    method: "GET",
    path: "/reviews",
    handler: ({ state, res, query }) => {
      const productId = query.get("productId");
      const rows = state.reviews.filter((review) => review.productId === productId);

      return page(res, sortRows(rows, query.get("orderBy"), query.get("order")), query);
    },
  },
  {
    method: "POST",
    path: "/reviews",
    handler: authed(async ({ state, req, res, user }) => {
      const body = await readJson(req);

      if (!body.content || String(body.content).trim() === "") {
        return validationFailed(res, [
          { field: "content", code: "isNotEmpty", message: "Content is required." },
        ]);
      }

      const review = {
        id: uid("review"),
        productId: body.productId,
        userId: user.id,
        rating: body.rating,
        content: body.content,
        ...timestamps(),
        user: { id: user.id, name: user.name, avatar: user.avatar },
      };

      state.reviews.push(review);

      return json(res, 201, review);
    }, "review:create:own"),
  },
  {
    method: "PUT",
    path: "/reviews/:id",
    handler: authed(async ({ state, req, res, params, user }) => {
      const review = state.reviews.find(
        (row) => row.id === params.id && row.userId === user.id,
      );

      if (!review) return notFound(res, "Review not found.");

      const body = await readJson(req);

      Object.assign(review, { rating: body.rating, content: body.content });

      return json(res, 200, review);
    }, "review:update:own"),
  },
  {
    method: "DELETE",
    path: "/reviews/:id",
    handler: authed(({ state, res, params, user }) => {
      const index = state.reviews.findIndex(
        (row) => row.id === params.id && row.userId === user.id,
      );

      if (index < 0) return notFound(res, "Review not found.");

      state.reviews.splice(index, 1);

      return json(res, 200, { message: "Deleted." });
    }, "review:delete:own"),
  },
];
