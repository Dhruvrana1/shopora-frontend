
/**
 * Converts backend responses to UI shapes.
 */

const first = (...values) =>
  values.find((value) => value !== undefined && value !== null);

const num = (value) =>
  value === undefined || value === null || value === ''
    ? null
    : Number(value);

/**
 * Supports arrays and common backend response formats.
 */
export function listFrom(data, ...keys) {
  if (Array.isArray(data)) return data;

  if (!data || typeof data !== 'object') return [];

  for (const key of [...keys, 'products', 'Products', 'Product', 'items', 'data']) {
    if (Array.isArray(data[key])) {
      return data[key];
    }

    if (data[key] && typeof data[key] === 'object') {
      const nested = data[key];

      if (Array.isArray(nested.products)) return nested.products;
      if (Array.isArray(nested.items)) return nested.items;

      if (nested.id !== undefined) return [nested];
    }
  }

  return data.id !== undefined ? [data] : [];
}

/**
 * Extracts image URLs from the supported backend formats.
 */
function toImageList(raw) {
  const imageData = first(
    raw.images,
    raw.product_images,
    raw.productImages,
    []
  );

  const urls = Array.isArray(imageData)
    ? imageData
        .map((image) => {
          if (typeof image === 'string') return image;

          if (image && typeof image === 'object') {
            return first(
              image.image_url,
              image.url,
              image.imageUrl,
              image.src
            );
          }

          return null;
        })
        .filter(
          (url) =>
            typeof url === 'string' &&
            url.trim().length > 0
        )
    : [];

  const singleImage = first(
    raw.image_url,
    raw.image,
    raw.thumbnail
  );

  if (urls.length === 0 && typeof singleImage === 'string') {
    urls.push(singleImage);
  }

  return [...new Set(urls)];
}

export function normalizeProduct(raw) {
  if (!raw) return null;

  return {
    id: raw.id,
    routeKey: first(raw.slug, raw.id),
    name: first(raw.name, 'Untitled product'),
    description: first(raw.description, ''),
    price: num(raw.price),
    sku: first(raw.sku, null),
    stock: num(first(raw.stock_quantity, raw.stock)),
    images: toImageList(raw),
    categoryId: first(raw.category_id, raw.categoryId, null),
    categoryName: first(
      raw.category_name,
      raw.category?.name,
      null
    ),
  };
}

export function normalizeCategory(raw) {
  if (!raw) return null;

  return {
    id: raw.id,
    routeKey: first(raw.slug, raw.id),
    name: first(raw.name, 'Category'),
    image: first(raw.image, raw.image_url, null),
  };
}

export function normalizeCartItem(raw, product) {
  return {
    id: raw.id,
    productId: raw.product_id,
    productKey: product?.routeKey ?? raw.product_id,
    name: first(
      raw.product_name,
      raw.name,
      product?.name,
      'Product'
    ),
    sku: first(raw.sku, product?.sku, null),
    price: num(first(raw.price, product?.price)),
    image: first(
      raw.image_url,
      product?.images?.[0],
      null
    ),
    quantity: Number(first(raw.quantity, 1)),
    stock: product ? product.stock : null,
  };
}

export function normalizeCart(data, productsById = new Map()) {
  const items = listFrom(data, 'items').map((raw) =>
    normalizeCartItem(
      raw,
      productsById.get(String(raw.product_id))
    )
  );

  const subtotal = items.reduce(
    (sum, item) =>
      sum + (item.price || 0) * item.quantity,
    0
  );

  return { items, subtotal };
}

export function normalizeOrder(raw) {
  if (!raw) return null;

  const items = listFrom(raw, 'items', 'order_items').map(
    (item) => ({
      id: first(item.id, item.product_id),
      name: first(
        item.product_name,
        item.name,
        'Product'
      ),
      sku: first(item.sku, null),
      quantity: Number(first(item.quantity, 1)),
      price: num(item.price),
      total: num(
        first(item.total, item.price * item.quantity)
      ),
    })
  );

  return {
    id: raw.id,
    orderNumber: first(raw.order_number, raw.id),
    subtotal: num(raw.subtotal),
    shipping: num(raw.shipping_charge),
    tax: num(raw.tax),
    total: num(raw.total_amount),
    paymentStatus: String(
      first(raw.payment_status, 'unknown')
    ),
    orderStatus: String(
      first(raw.order_status, 'unknown')
    ),
    createdAt: first(raw.created_at, null),
    shippingAddress: first(raw.shipping_address, null),
    billingAddress: first(raw.billing_address, null),
    items,
  };
}
