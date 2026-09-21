import {
  authed,
  byKeyword,
  json,
  notFound,
  page,
  readJson,
  sortRows,
  uid,
  validationFailed,
} from "../helpers.mjs";

/** Catalogue management and order fulfilment: the `manage-*` namespaces. */
export const manageRoutes = [
  {
    method: "GET",
    path: "/manage-product/products",
    handler: authed(({ state, res, query }) => {
      const rows = sortRows(
        byKeyword(state.products, query.get("keyword")),
        query.get("orderBy"),
        query.get("order"),
      );

      return page(res, rows, query);
    }, "product:read:any"),
  },
  {
    method: "POST",
    path: "/manage-product/products",
    handler: authed(async ({ state, req, res }) => {
      const body = await readJson(req);
      const details = [];

      if (!body.name) details.push({ field: "name", code: "isNotEmpty", message: "Name is required." });
      if (!body.images?.length) details.push({ field: "images", code: "isNotEmpty", message: "At least one image is required." });

      if (details.length > 0) return validationFailed(res, details);

      const product = {
        id: uid("product"),
        name: body.name,
        basePrice: body.basePrice,
        virtualPrice: body.virtualPrice,
        publishedAt: body.publishedAt,
        images: body.images,
        brand: state.brands.find((item) => item.id === body.brandId) ?? null,
        categories: state.categories.filter((item) => body.categoryIds.includes(item.id)),
        variants: body.variants,
        skus: body.skus.map((sku) => ({ ...sku, id: uid("sku") })),
        productTranslations: [],
      };

      state.products.push(product);

      return json(res, 201, product);
    }, "product:create:any"),
  },
  {
    method: "GET",
    path: "/manage-product/products/:id",
    handler: authed(({ state, res, params }) => {
      const product = state.products.find((item) => item.id === params.id);

      return product ? json(res, 200, product) : notFound(res, "Product not found.");
    }, "product:read:any"),
  },
  {
    method: "PUT",
    path: "/manage-product/products/:id",
    handler: authed(async ({ state, req, res, params }) => {
      const product = state.products.find((item) => item.id === params.id);

      if (!product) return notFound(res, "Product not found.");

      const body = await readJson(req);

      Object.assign(product, {
        name: body.name ?? product.name,
        basePrice: body.basePrice ?? product.basePrice,
        virtualPrice: body.virtualPrice ?? product.virtualPrice,
        images: body.images ?? product.images,
        publishedAt: body.publishedAt ?? product.publishedAt,
        brand: state.brands.find((item) => item.id === body.brandId) ?? product.brand,
        categories: body.categoryIds
          ? state.categories.filter((item) => body.categoryIds.includes(item.id))
          : product.categories,
        variants: body.variants ?? product.variants,
        skus: (body.skus ?? product.skus).map((sku) => ({
          ...sku,
          id: sku.id ?? uid("sku"),
        })),
      });

      return json(res, 200, product);
    }, "product:update:own"),
  },
  {
    method: "DELETE",
    path: "/manage-product/products/:id",
    handler: authed(({ state, res, params }) => {
      const index = state.products.findIndex((item) => item.id === params.id);

      if (index < 0) return notFound(res, "Product not found.");

      state.products.splice(index, 1);

      return json(res, 200, { message: "Deleted." });
    }, "product:delete:own"),
  },
  {
    method: "GET",
    path: "/manage-order/orders",
    handler: authed(({ state, res, query }) => {
      const status = query.get("status");
      let rows = state.orders;

      if (status) rows = rows.filter((order) => order.status === status);

      return page(
        res,
        sortRows(rows, query.get("orderBy"), query.get("order")).map(
          ({ userId: _userId, items: _items, ...order }) => order,
        ),
        query,
      );
    }, "order-fulfilment:read:any"),
  },
  {
    method: "GET",
    path: "/manage-order/orders/:id",
    handler: authed(({ state, res, params }) => {
      const order = state.orders.find((item) => item.id === params.id);

      return order
        ? json(res, 200, { ...order, userId: undefined })
        : notFound(res, "Order not found.");
    }, "order-fulfilment:read:any"),
  },
  {
    method: "PUT",
    path: "/manage-order/orders/:id/status",
    handler: authed(async ({ state, req, res, params }) => {
      const order = state.orders.find((item) => item.id === params.id);

      if (!order) return notFound(res, "Order not found.");

      order.status = (await readJson(req)).status;

      return json(res, 200, { ...order, userId: undefined });
    }, "order-fulfilment:update:any"),
  },
];
