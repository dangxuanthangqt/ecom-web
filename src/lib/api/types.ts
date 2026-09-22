import type { components } from "./schema";

type Schemas = components["schemas"];

/**
 * The error envelope, straight from the generated schema. `ApiErrorCode` is the
 * union the API publishes; a `switch` over it is what the codes exist for.
 */
export type ApiErrorBody = Schemas["ErrorResponseDto"];
export type ApiErrorDetail = Schemas["ErrorDetailDto"];
export type ApiErrorCode = ApiErrorBody["error"];

export type Product = Schemas["ProductResponseDto"];
export type ProductDetail = Schemas["ProductDetailResponseDto"];
export type ProductTranslation = Schemas["ProductTranslationResponseDto"];
export type Variant = Schemas["VariantResponseDto"];
export type Sku = Schemas["BaseSKUResponseDto"];
export type CreateProductBody = Schemas["CreateProductRequestDto"];
export type UpdateProductBody = Schemas["UpdateProductRequestDto"];

export type Brand = Schemas["BaseBrandResponseDto"];
export type BrandWithTranslations =
  Schemas["BrandWithBrandTranslationsResponseDto"];
export type BrandTranslation =
  Schemas["BrandTranslationWithBrandAndLanguageResponseDto"];

export type Category = Schemas["BaseCategoryResponseDto"];
export type CategoryWithChildren =
  Schemas["CategoryWithChildrenCategoriesResponseDto"];
export type CategoryTranslation =
  Schemas["CategoryTranslationWithCategoryAndLanguageResponseDto"];

export type CartItem = Schemas["CartItemDetailResponseDto"];

export type Order = Schemas["BaseOrderResponseDto"];
export type OrderDetail = Schemas["OrderDetailResponseDto"];
export type ManageOrderDetail = Schemas["ManageOrderDetailResponseDto"];
export type OrderItem = Schemas["ProductSkuSnapshotResponseDto"];
export type OrderStatus = Schemas["UpdateOrderStatusRequestDto"]["status"];

export const ORDER_STATUSES = [
  "PENDING_CONFIRMATION",
  "PENDING_PICKUP",
  "PENDING_DELIVERY",
  "DELIVERED",
  "RETURNED",
  "CANCELLED",
] as const satisfies readonly OrderStatus[];

export type Review = Schemas["ReviewWithAuthorResponseDto"];

export type Profile = Schemas["ProfileResponseDto"];
export type UserItem = Schemas["UserItemResponseDto"];
export type UserStatus = Schemas["UserStatus"];
export type Role = Schemas["RoleResponseDto"];
export type RoleWithPermissions = Schemas["RoleWithPermissionsResponseDto"];
export type Permission = Schemas["PermissionResponseDto"];
export type PermissionWithRoles = Schemas["PermissionWithRolesResponseDto"];

export type Language = Schemas["LanguageResponseDto"];

export type UploadedFile = Schemas["UploadFileResponseDto"];
export type UploadedFiles = Schemas["UploadFilesResponseDto"];
export type PresignedUrl = Schemas["PresignedUrlResponseDto"];

export type ProductSortField =
  | "createdAt"
  | "name"
  | "basePrice"
  | "publishedAt"
  | "updatedAt"
  | "virtualPrice"
  | "sale";

export type SortOrder = "asc" | "desc";

export type ProductQuery = {
  pageIndex?: number;
  pageSize?: number;
  order?: SortOrder;
  orderBy?: ProductSortField;
  keyword?: string;
  name?: string;
  brandIds?: string[];
  categoryIds?: string[];
  minPrice?: number;
  maxPrice?: number;
};

export type PageQuery = {
  pageIndex?: number;
  pageSize?: number;
  order?: SortOrder;
  orderBy?: string;
  keyword?: string;
};
