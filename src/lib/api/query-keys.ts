import type { PageQuery, ProductQuery } from "./types";

/** One place to look when you need to know what an invalidation will hit. */
export const queryKeys = {
  profile: ["profile"] as const,

  products: (query: ProductQuery) => ["products", query] as const,
  product: (id: string) => ["product", id] as const,

  manageProducts: (query: PageQuery) => ["manage-products", query] as const,
  manageProduct: (id: string) => ["manage-product", id] as const,

  brands: (query: PageQuery) => ["brands", query] as const,
  brand: (id: string) => ["brand", id] as const,
  brandTranslations: (query: PageQuery) => ["brand-translations", query] as const,

  categories: (parentCategoryId?: string) =>
    ["categories", parentCategoryId ?? null] as const,
  category: (id: string) => ["category", id] as const,
  categoryTranslations: (query: PageQuery) =>
    ["category-translations", query] as const,

  productTranslations: (query: PageQuery) =>
    ["product-translations", query] as const,

  cart: (query: PageQuery) => ["cart", query] as const,

  orders: (query: PageQuery) => ["orders", query] as const,
  order: (id: string) => ["order", id] as const,
  manageOrders: (query: Record<string, unknown>) =>
    ["manage-orders", query] as const,
  manageOrder: (id: string) => ["manage-order", id] as const,

  reviews: (productId: string, query: PageQuery) =>
    ["reviews", productId, query] as const,

  users: (query: PageQuery) => ["users", query] as const,
  user: (id: string) => ["user", id] as const,

  roles: (query: PageQuery) => ["roles", query] as const,
  role: (id: string) => ["role", id] as const,

  permissions: (query: PageQuery) => ["permissions", query] as const,
  permission: (id: string) => ["permission", id] as const,

  languages: ["languages"] as const,
  language: (id: string) => ["language", id] as const,
};
