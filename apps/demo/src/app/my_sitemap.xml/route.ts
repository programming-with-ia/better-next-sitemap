import {
  generateNextSitemap,
  sitemapResponse,
} from "better-next-sitemap";
import sitemap from "@/app/sitemap";

export async function GET() {
  // This is the simplest way to migrate an existing sitemap.ts file.
  // We import the native Next.js sitemap and pass it to generateNextSitemap.
  // Next.js returns an array of objects, and our package converts it to XML.
  const xml = await generateNextSitemap(sitemap);
  console.log(xml);
  
  return sitemapResponse(xml);
}
