import type { Profile } from "@/lib/api/types";

/** Permission keys are `resource:action:scope`, e.g. `product:create:any`. */
export type PermissionKey = string;

export function permissionKeys(profile?: Profile | null): Set<string> {
  return new Set(profile?.role?.permissions?.map((item) => item.key) ?? []);
}

export function hasPermission(
  profile: Profile | null | undefined,
  ...keys: PermissionKey[]
) {
  const owned = permissionKeys(profile);

  return keys.some((key) => owned.has(key));
}

/** The permission that unlocks each admin section's nav entry and page. */
export const ADMIN_SECTION_PERMISSIONS = {
  products: ["product:read:any", "product:read:own", "product:create:any"],
  brands: ["brand:read:any"],
  categories: ["category:read:any"],
  translations: [
    "brand-translation:read:any",
    "category-translation:read:any",
    "product-translation:read:own",
  ],
  languages: ["language:read:any"],
  orders: ["order-fulfilment:read:any", "order:read:any"],
  users: ["user:read:any"],
  roles: ["role:read:any"],
  permissions: ["permission:read:any"],
  // Not `media:upload:own`: every shopper holds that one for their avatar,
  // and it must not be what opens the admin area.
  media: ["media:read:any", "media:delete:any"],
} as const satisfies Record<string, readonly PermissionKey[]>;

export type AdminSection = keyof typeof ADMIN_SECTION_PERMISSIONS;

export function canSee(
  profile: Profile | null | undefined,
  section: AdminSection,
) {
  return hasPermission(profile, ...ADMIN_SECTION_PERMISSIONS[section]);
}

/** Anyone holding at least one management permission belongs in /admin. */
export function canAccessAdmin(profile: Profile | null | undefined) {
  return (Object.keys(ADMIN_SECTION_PERMISSIONS) as AdminSection[]).some(
    (section) => canSee(profile, section),
  );
}
