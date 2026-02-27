import {
  generateNextSitemap,
  generateSitemap,
  type SitemapGenerators,
  sitemapResponse,
} from "better-next-sitemap";
import { type NextRequest, NextResponse } from "next/server"; //! use response instead of next response
import { getUrl } from "@/lib/routes";
import sitemap, { generateSitemaps } from "@/app/sitemap.e2";

const baseURL = "https://acme.com";

// We combine both methods into a single GET request for demonstration purposes.
// App logic can route based on the incoming filename or a query parameter.
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;
  
  // Example 1: Migrated Approach
  // We use a query parameter `?type=migrated` to demonstrate the easy 1-to-1 migration 
  // from Next.js native sitemaps. In a real app, this could just be a separate route or the default behavior.
  const searchParams = request.nextUrl.searchParams;
  const isMigrated = searchParams.get("type") === "migrated";

  if (isMigrated) {
    const xml = await generateNextSitemap(filename, {
      root: `${baseURL}/sitemaps`,
      sitemap: sitemap,
      generateSitemaps,
    });

    if (!xml) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return sitemapResponse(xml);
  }

  // Example 2: Advanced Generators Approach
  // This is the default behavior if no `?type=migrated` parameter is provided.
  if (!filename.endsWith(".xml")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const generators: SitemapGenerators = {
    // output: /sitemaps/static.xml
    static: () => {
      return [
        {
          url: "https://acme.com",
          lastModified: new Date(),
          changeFrequency: "yearly",
          priority: 1,
        },
        {
          url: "https://acme.com/about",
          lastModified: new Date(),
          changeFrequency: "monthly",
          priority: 0.8,
        },
      ];
    },
    // output: /sitemaps/products.xml
    products: async () => {
      // Generate dummy products for this example
      const products = Array.from({ length: 5 }, (_, i) => ({
        id: i,
        date: new Date().toISOString(),
      }));

      return products.map((product) => ({
        url: `https://example.com/product/${product.id}`,
        lastModified: product.date,
      }));
    },
  };

  // output: /sitemaps/static.xml
  // output: /sitemaps/products.xml
  // output: /sitemaps/sitemap_index.xml
  const xml = await generateSitemap(filename, {
    root: `${baseURL}/sitemaps`,
    generators: generators,
    // indexFile: "sitemap_index", // optional
  });

  if (!xml) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return sitemapResponse(xml);
}

