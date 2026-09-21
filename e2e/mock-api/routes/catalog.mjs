import {
  authed,
  byKeyword,
  json,
  notFound,
  page,
  sortRows,
  uid,
} from "../helpers.mjs";
import { collection } from "./collection.mjs";

const publicProduct = (product) => ({
  id: product.id,
  publishedAt: product.publishedAt,
  name: product.name,
  basePrice: product.basePrice,
  virtualPrice: product.virtualPrice,
  images: product.images,
  brand: product.brand,
  variants: product.variants,
  productTranslations: product.productTranslations,
});

function filterProducts(state, query) {
  const brandIds = query.getAll("brandIds");
  const categoryIds = query.getAll("categoryIds");
  const minPrice = query.get("minPrice");
  const maxPrice = query.get("maxPrice");

  let rows = byKeyword(state.products, query.get("keyword"));

  if (brandIds.length > 0) {
    rows = rows.filter((product) => brandIds.includes(product.brand?.id));
  }

  if (categoryIds.length > 0) {
    rows = rows.filter((product) =>
      product.categories.some((category) => categoryIds.includes(category.id)),
    );
  }

  if (minPrice) rows = rows.filter((product) => product.basePrice >= Number(minPrice));
  if (maxPrice) rows = rows.filter((product) => product.basePrice <= Number(maxPrice));

  return sortRows(rows, query.get("orderBy"), query.get("order"));
}

export const catalogRoutes = [
  {
    method: "GET",
    path: "/products",
    handler: ({ state, res, query }) =>
      page(res, filterProducts(state, query).map(publicProduct), query),
  },
  {
    method: "GET",
    path: "/products/:id",
    handler: ({ state, res, params }) => {
      const product = state.products.find((item) => item.id === params.id);

      return product ? json(res, 200, product) : notFound(res, "Product not found.");
    },
  },
  {
    method: "GET",
    path: "/categories",
    handler: authed(
      ({ state, res }) =>
        json(res, 200, {
          data: state.categories,
          totalCount: state.categories.length,
        }),
      "category:read:any",
    ),
  },
  ...collection({
    key: "brands",
    readPermission: undefined, // `/brands` is public in the real API
    writePermission: "brand:create:any",
    create: (body) => ({
      id: uid("brand"),
      name: body.name,
      logo: body.logo,
      brandTranslations: [],
    }),
    update: (body) => ({ name: body.name, logo: body.logo }),
  }).filter((route) => !(route.method === "GET" && route.path === "/brands")),
  {
    method: "GET",
    path: "/brands",
    handler: ({ state, res, query }) =>
      page(res, byKeyword(state.brands, query.get("keyword")), query),
  },
  ...collection({
    key: "categories",
    readPermission: "category:read:any",
    writePermission: "category:create:any",
    create: (body, state) => ({
      id: uid("cat"),
      name: body.name,
      logo: body.logo ?? null,
      parentCategory:
        state.categories.find((item) => item.id === body.parentCategoryId) ?? null,
      categoryTranslations: [],
      childrenCategories: [],
    }),
    update: (body, state) => ({
      name: body.name,
      logo: body.logo ?? null,
      parentCategory:
        state.categories.find((item) => item.id === body.parentCategoryId) ?? null,
    }),
  }).filter((route) => !(route.method === "GET" && route.path === "/categories")),
];
