
import { call, ENDPOINTS } from './api';
import {
  listFrom,
  normalizeProduct,
} from '../utils/adapters';

const SORTERS = {
  price_asc: (a, b) =>
    (a.price ?? Infinity) - (b.price ?? Infinity),

  price_desc: (a, b) =>
    (b.price ?? -Infinity) - (a.price ?? -Infinity),

  name_asc: (a, b) =>
    a.name.localeCompare(b.name),
};

/**
 * Fetches the full catalogue, including available images.
 */
async function fetchAllProducts(signal) {
  const data = await call(ENDPOINTS.products.list, {
    auth: false,
    signal,
  });

  const rawProducts = listFrom(
    data,
    'products',
    'Products',
    'Product',
    'items',
    'data'
  );

  return rawProducts
    .map(normalizeProduct)
    .filter(Boolean);
}

/**
 * Lists products, preserving images when a category endpoint
 * does not include them.
 */
export async function list(
  { search, category, sort, limit } = {},
  signal
) {
  let items;

  if (category) {
    // Fetch the selected category.
    const categoryData = await call(
      ENDPOINTS.categories.products,
      {
        args: [category],
        auth: false,
        signal,
      }
    );

    const categoryProducts = listFrom(
      categoryData,
      'products',
      'Products',
      'Product',
      'items',
      'data'
    );

    // Fetch the full catalogue, where product images are available.
    const allProducts = await fetchAllProducts(signal);

    const catalogueById = new Map(
      allProducts.map((product) => [
        String(product.id),
        product,
      ])
    );

    // Add catalogue images to category products by product ID.
    items = categoryProducts
      .map((rawProduct) => {
        const product = normalizeProduct(rawProduct);

        if (!product) return null;

        const catalogueProduct = catalogueById.get(
          String(product.id)
        );

        return {
          ...product,
          images:
            product.images.length > 0
              ? product.images
              : catalogueProduct?.images ?? [],
          name: product.name || catalogueProduct?.name,
          price: product.price ?? catalogueProduct?.price,
          description:
            product.description ||
            catalogueProduct?.description ||
            '',
          stock:
            product.stock ?? catalogueProduct?.stock,
          sku: product.sku ?? catalogueProduct?.sku,
          routeKey:
            product.routeKey ??
            catalogueProduct?.routeKey,
        };
      })
      .filter(Boolean);
  } else {
    items = await fetchAllProducts(signal);
  }

  // Search products.
  const query = (search || '').trim().toLowerCase();

  if (query) {
    items = items.filter((product) =>
      `${product.name} ${product.description} ${
        product.sku || ''
      }`
        .toLowerCase()
        .includes(query)
    );
  }

  // Sort products.
  if (SORTERS[sort]) {
    items = [...items].sort(SORTERS[sort]);
  }

  const total = items.length;

  // Apply limit after filtering and sorting.
  if (limit) {
    items = items.slice(0, limit);
  }

  console.log(
    'Final products with images:',
    items.map((product) => ({
      name: product.name,
      images: product.images,
    }))
  );

  return { items, total };
}

/**
 * Full catalogue, used by the cart to fill in names and images.
 */
export async function listAll(signal) {
  return fetchAllProducts(signal);
}


/**
 * Fetches one product for the product detail page.
 */
export async function getOne(slug, signal) {
  const data = await call(ENDPOINTS.products.detail, {
    args: [slug],
    auth: false,
    signal,
  });

  const rawProducts = listFrom(
    data,
    'product',
    'Product',
    'products',
    'Products',
    'data'
  );

  const rawProduct = rawProducts[0];

  if (!rawProduct) {
    throw new Error(`Product not found: ${slug}`);
  }

  const product = normalizeProduct(rawProduct);

  // If the detail endpoint doesn't include images, look them up
  // in the full catalogue.
  if (product.images.length === 0) {
    const allProducts = await fetchAllProducts(signal);

    const matchingProduct = allProducts.find(
      (item) =>
        String(item.id) === String(product.id) ||
        item.routeKey === String(slug)
    );

    if (matchingProduct) {
      return {
        ...product,
        ...matchingProduct,
        images: matchingProduct.images,
      };
    }
  }

  return product;
}
