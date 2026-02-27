import type { MetadataRoute } from "next";

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = +(await props.id);

  const start = id * 50000;

  // Generate dummy products for this example
  const products = Array.from({ length: 5 }, (_, i) => ({
    id: start + i,
    date: new Date().toISOString(),
  }));

  return products.map((product) => ({
    url: `https://example.com/product/${product.id}`,
    lastModified: product.date,
  }));
}
