import {
  generateSitemapIndexXml,
  generateSitemapXml,
  type SitemapFile,
} from "./utils";

export type SitemapConfig = {
  sitemap: (props: { id: Promise<string> }) => Promise<SitemapFile | undefined>;
  generateSitemaps: () => Promise<{ id: string }[]>;
  root: string;
  indexFile?: string;
};

export type SitemapCallback = () => SitemapFile | Promise<SitemapFile>;

export function generateNextSitemap(fn: SitemapCallback): Promise<string>;

export function generateNextSitemap(
  fileId: string,
  config: SitemapConfig,
): Promise<string | undefined>;

export async function generateNextSitemap(
  fnOrFileId: string | SitemapCallback,
  config?: SitemapConfig,
): Promise<string | undefined> {
  if (typeof fnOrFileId === "function") {
    return generateSitemapXml(await fnOrFileId());
  }

  const fileId = fnOrFileId;
  if (!config) return;
  const {
    sitemap,
    generateSitemaps,
    root,
    indexFile = "sitemap_index",
  } = config;

  if (!fileId.endsWith(".xml")) return;
  const id = fileId.replace(".xml", "");

  if (id === indexFile) {
    if (!root || !generateSitemaps) return;
    return generateSitemapIndexXml({
      root,
      sitemaps: (await generateSitemaps()).map((s) => s.id),
    });
  }
  const sitemapFile = await sitemap({ id: Promise.resolve(id) });
  if (sitemapFile) return generateSitemapXml(sitemapFile);

  return;
}
