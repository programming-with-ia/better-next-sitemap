import type { MetadataRoute } from "next";

export type SitemapFile = MetadataRoute.Sitemap;
export type SitemapGenerator = () => SitemapFile | Promise<SitemapFile>;
export type SitemapGenerators = Record<string, SitemapGenerator>;

/** Escapes XML special characters to prevent malformed output or injection. */
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function generateSitemapXml(sitemap: SitemapFile): string {
  let hasImages = false;
  let hasVideos = false;
  let hasAlternates = false;

  const entryParts: string[] = [];

  for (const entry of sitemap) {
    const parts: string[] = [`<url><loc>${escapeXml(entry.url)}</loc>`];

    if (entry.lastModified) {
      const lastMod =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified;
      parts.push(`<lastmod>${escapeXml(lastMod)}</lastmod>`);
    }

    if (entry.changeFrequency) {
      parts.push(`<changefreq>${escapeXml(entry.changeFrequency)}</changefreq>`);
    }

    if (entry.priority !== undefined) {
      parts.push(`<priority>${parseFloat(entry.priority.toFixed(1))}</priority>`);
    }

    // Alternates (hreflang)
    if (entry.alternates?.languages) {
      hasAlternates = true;
      for (const [lang, url] of Object.entries(entry.alternates.languages)) {
        parts.push(
          `<xhtml:link rel="alternate" hreflang="${escapeXml(lang)}" href="${escapeXml(url as string)}"/>`,
        );
      }
    }

    // Images
    if (entry.images && entry.images.length > 0) {
      hasImages = true;
      for (const image of entry.images) {
        parts.push(`<image:image><image:loc>${escapeXml(image)}</image:loc></image:image>`);
      }
    }

    // Videos
    if (entry.videos && entry.videos.length > 0) {
      hasVideos = true;
      for (const video of entry.videos) {
        parts.push(`<video:video>`);
        parts.push(`<video:thumbnail_loc>${escapeXml(video.thumbnail_loc)}</video:thumbnail_loc>`);
        parts.push(`<video:title>${escapeXml(video.title)}</video:title>`);
        parts.push(`<video:description>${escapeXml(video.description)}</video:description>`);
        if (video.content_loc)
          parts.push(`<video:content_loc>${escapeXml(video.content_loc)}</video:content_loc>`);
        if (video.player_loc)
          parts.push(`<video:player_loc>${escapeXml(video.player_loc)}</video:player_loc>`);
        if (video.duration)
          parts.push(`<video:duration>${video.duration}</video:duration>`);
        if (video.view_count)
          parts.push(`<video:view_count>${video.view_count}</video:view_count>`);
        if (video.tag)
          parts.push(`<video:tag>${escapeXml(video.tag)}</video:tag>`);
        if (video.rating)
          parts.push(`<video:rating>${video.rating}</video:rating>`);
        if (video.expiration_date) {
          const exp = video.expiration_date instanceof Date ? video.expiration_date.toISOString() : video.expiration_date;
          parts.push(`<video:expiration_date>${escapeXml(exp)}</video:expiration_date>`);
        }
        if (video.publication_date) {
          const pub = video.publication_date instanceof Date ? video.publication_date.toISOString() : video.publication_date;
          parts.push(`<video:publication_date>${escapeXml(pub)}</video:publication_date>`);
        }
        if (video.family_friendly)
          parts.push(`<video:family_friendly>${escapeXml(video.family_friendly)}</video:family_friendly>`);
        parts.push(`</video:video>`);
      }
    }

    parts.push(`</url>`);
    entryParts.push(parts.join(""));
  }

  const nsParts: string[] = ['xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"'];
  if (hasImages) nsParts.push('xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"');
  if (hasVideos) nsParts.push('xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"');
  if (hasAlternates) nsParts.push('xmlns:xhtml="http://www.w3.org/1999/xhtml"');

  return `<?xml version="1.0" encoding="UTF-8"?><urlset ${nsParts.join(" ")}>${entryParts.join("")}</urlset>`;
}

export type SitemapIndexOptions = {
  root: string;
  sitemaps: string[];
};

export function generateSitemapIndexXml(options: SitemapIndexOptions): string {
  const { root, sitemaps } = options;
  const baseUrl = root.endsWith("/") ? root.slice(0, -1) : root;

  const entries = sitemaps
    .map((name) => {
      const fileName = name.endsWith(".xml") ? name : `${name}.xml`;
      return `<sitemap><loc>${escapeXml(baseUrl)}/${escapeXml(fileName)}</loc></sitemap>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?><sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${entries}</sitemapindex>`;
}

export async function generateSitemap(
  file: string,
  {
    generators,
    root,
    indexFile = "sitemap_index",
  }: {
    generators: SitemapGenerators;
    root: string;
    indexFile?: string;
  },
): Promise<string | undefined> {
  if (!file.endsWith(".xml")) {
    return undefined;
  }

  const fileId = file.replace(".xml", "");

  if (fileId === indexFile.replace(".xml", "")) {
    return generateSitemapIndexXml({
      root,
      sitemaps: Object.keys(generators),
    });
  }

  const generator = generators[fileId];
  if (generator) {
    return generateSitemapXml(await generator());
  }

  return undefined;
}
