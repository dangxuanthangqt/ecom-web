/** Shapes shared by the cart and the order routes. */
export const findSku = (state, skuId) => {
  for (const product of state.products) {
    const sku = product.skus.find((item) => item.id === skuId);

    if (sku) return { product, sku };
  }

  return null;
};

export const cartItemView = (state, item) => {
  const found = findSku(state, item.skuId);

  return {
    id: item.id,
    quantity: item.quantity,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    sku: {
      id: found.sku.id,
      order: 0,
      image: found.sku.image,
      price: found.sku.price,
      stock: found.sku.stock,
      value: found.sku.value,
      product: { id: found.product.id, name: found.product.name },
    },
  };
};
