/**
 * Seed data for the mock API. Shapes follow `swagger.yaml` exactly — if the
 * real contract changes, this is the file that has to move with it.
 */

const ALL_PERMISSION_KEYS = [
  "brand:create:any", "brand:delete:any", "brand:read:any", "brand:update:any",
  "brand-translation:create:any", "brand-translation:delete:any",
  "brand-translation:read:any", "brand-translation:update:any",
  "category:create:any", "category:delete:any", "category:read:any", "category:update:any",
  "category-translation:create:any", "category-translation:delete:any",
  "category-translation:read:any", "category-translation:update:any",
  "language:create:any", "language:delete:any", "language:read:any", "language:update:any",
  "media:delete:any", "media:read:any", "media:upload:own",
  "order-fulfilment:read:any", "order-fulfilment:update:any",
  "order:cancel:own", "order:create:own", "order:read:any", "order:read:own",
  "permission:read:any",
  "product:create:any", "product:delete:own", "product:read:any", "product:update:own",
  "product-translation:create:own", "product-translation:delete:own",
  "product-translation:read:own", "product-translation:update:own",
  "profile:read:own", "profile:update:own",
  "review:create:own", "review:delete:own", "review:update:own",
  "role:create:any", "role:delete:any", "role:read:any", "role:update:any",
  "user:create:any", "user:delete:any", "user:read:any",
  "cart:read:own", "cart:update:own",
];

/** What a plain shopper is allowed to do — no `:any` management keys. */
const CLIENT_PERMISSION_KEYS = [
  "cart:read:own", "cart:update:own",
  "order:cancel:own", "order:create:own", "order:read:own",
  "profile:read:own", "profile:update:own",
  "review:create:own", "review:delete:own", "review:update:own",
  "media:upload:own",
];

const permission = (key) => {
  const [resource, action, scope] = key.split(":");

  return { id: `perm-${key}`, key, resource, action, scope, description: key };
};

export const ADMIN_CREDENTIALS = {
  email: "admin@ecom.test",
  password: "adminPassword1",
};

export const CLIENT_CREDENTIALS = {
  email: "shopper@ecom.test",
  password: "shopperPass1",
};

/** Holds only `brand:*` plus profile — proves the admin nav filters by permission. */
export const EDITOR_CREDENTIALS = {
  email: "editor@ecom.test",
  password: "editorPass1",
};

export const TWO_FACTOR_CREDENTIALS = {
  email: "twofactor@ecom.test",
  password: "twoFactorPass1",
  totpCode: "123456",
};

export function createState() {
  const permissions = ALL_PERMISSION_KEYS.map(permission);
  const permissionByKey = new Map(permissions.map((item) => [item.key, item]));

  const adminRole = {
    id: "role-admin",
    name: "ADMIN",
    description: "Full access",
    isActive: true,
    isSystem: true,
    permissions,
  };

  const clientRole = {
    id: "role-client",
    name: "CLIENT",
    description: "Shopper",
    isActive: true,
    isSystem: true,
    permissions: CLIENT_PERMISSION_KEYS.map((key) => permissionByKey.get(key)),
  };

  const editorRole = {
    id: "role-editor",
    name: "CATALOG_EDITOR",
    description: "Catalogue only",
    isActive: true,
    isSystem: false,
    permissions: ["brand:read:any", "brand:update:any", "profile:read:own"].map(
      (key) => permissionByKey.get(key),
    ),
  };

  const users = [
    {
      id: "user-admin",
      email: ADMIN_CREDENTIALS.email,
      password: ADMIN_CREDENTIALS.password,
      name: "Ada Admin",
      phoneNumber: "0900000001",
      avatar: "https://cdn.test/avatar-admin.png",
      status: "ACTIVE",
      role: adminRole,
      twoFactorEnabled: false,
    },
    {
      id: "user-client",
      email: CLIENT_CREDENTIALS.email,
      password: CLIENT_CREDENTIALS.password,
      name: "Chi Shopper",
      phoneNumber: "0900000002",
      avatar: "https://cdn.test/avatar-client.png",
      status: "ACTIVE",
      role: clientRole,
      twoFactorEnabled: false,
    },
    {
      id: "user-editor",
      email: EDITOR_CREDENTIALS.email,
      password: EDITOR_CREDENTIALS.password,
      name: "Ly Editor",
      phoneNumber: "0900000004",
      avatar: null,
      status: "ACTIVE",
      role: editorRole,
      twoFactorEnabled: false,
    },
    {
      id: "user-2fa",
      email: TWO_FACTOR_CREDENTIALS.email,
      password: TWO_FACTOR_CREDENTIALS.password,
      name: "Tuan TwoFactor",
      phoneNumber: "0900000003",
      avatar: "https://cdn.test/avatar-2fa.png",
      status: "ACTIVE",
      role: clientRole,
      twoFactorEnabled: true,
    },
  ];

  const languages = [
    { id: "en", name: "English" },
    { id: "vn", name: "Tiếng Việt" },
  ];

  const brands = [
    { id: "brand-aurora", name: "Aurora", logo: "https://cdn.test/aurora.png", brandTranslations: [] },
    { id: "brand-nimbus", name: "Nimbus", logo: "https://cdn.test/nimbus.png", brandTranslations: [] },
  ];

  const categories = [
    {
      id: "cat-audio",
      name: "Audio",
      logo: "https://cdn.test/audio.png",
      parentCategory: null,
      categoryTranslations: [],
      childrenCategories: [],
    },
    {
      id: "cat-wearables",
      name: "Wearables",
      logo: "https://cdn.test/wearables.png",
      parentCategory: null,
      categoryTranslations: [],
      childrenCategories: [],
    },
  ];

  const products = [
    buildProduct({
      id: "product-headphones",
      name: "Aurora Headphones",
      basePrice: 120,
      virtualPrice: 150,
      brand: brands[0],
      categories: [categories[0]],
      viName: "Tai nghe Aurora",
      viDescription: "Tai nghe chụp tai chống ồn chủ động.",
      enDescription: "Over-ear headphones with active noise cancelling.",
    }),
    buildProduct({
      id: "product-watch",
      name: "Nimbus Watch",
      basePrice: 90,
      virtualPrice: 90,
      brand: brands[1],
      categories: [categories[1]],
      viName: "Đồng hồ Nimbus",
      viDescription: "Đồng hồ thông minh pin 14 ngày.",
      enDescription: "Smart watch with a 14 day battery.",
    }),
  ];

  return {
    users,
    roles: [adminRole, clientRole, editorRole],
    permissions,
    languages,
    brands,
    categories,
    products,
    brandTranslations: [],
    categoryTranslations: [],
    productTranslations: [],
    cartItems: [],
    orders: [],
    reviews: [
      {
        id: "review-1",
        productId: "product-headphones",
        userId: "user-client",
        rating: 5,
        content: "Âm thanh rất tốt.",
        createdAt: "2026-09-01T10:00:00.000Z",
        updatedAt: "2026-09-01T10:00:00.000Z",
        user: { id: "user-client", name: "Chi Shopper", avatar: null },
      },
    ],
    otpCodes: new Map(),
    issuedAccessTokens: new Set(),
    sessions: new Map(),
    revokedAccessTokens: new Set(),
  };
}

function buildProduct({
  id, name, basePrice, virtualPrice, brand, categories,
  viName, viDescription, enDescription,
}) {
  return {
    id,
    name,
    basePrice,
    virtualPrice,
    publishedAt: "2026-08-01T00:00:00.000Z",
    images: [`https://cdn.test/${id}-1.png`, `https://cdn.test/${id}-2.png`],
    brand: { id: brand.id, name: brand.name, logo: brand.logo },
    categories: categories.map((item) => ({ id: item.id, name: item.name })),
    variants: [{ value: "Color", options: ["Black", "White"] }],
    skus: [
      { id: `${id}-sku-black`, value: "Black", price: basePrice, stock: 7, image: `https://cdn.test/${id}-black.png` },
      { id: `${id}-sku-white`, value: "White", price: basePrice + 10, stock: 0, image: `https://cdn.test/${id}-white.png` },
    ],
    productTranslations: [
      { id: `${id}-tr-vn`, name: viName, description: viDescription, language: { id: "vn", name: "Tiếng Việt" } },
      { id: `${id}-tr-en`, name, description: enDescription, language: { id: "en", name: "English" } },
    ],
  };
}
