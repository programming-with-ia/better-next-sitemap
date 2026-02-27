# better-next-sitemap

[![npm version](https://img.shields.io/npm/v/better-next-sitemap?color=blue&label=npm)](https://www.npmjs.com/package/better-next-sitemap)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-13%20%7C%2014%20%7C%2015%20%7C%2016-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Bundle Size](https://img.shields.io/bundlephobia/minzip/better-next-sitemap?label=bundle%20size)](https://bundlephobia.com/package/better-next-sitemap)

A better sitemap generator for Next.js App Router — with full support for images, videos, hreflang alternates, sitemap indexes, and dynamic generation at scale.

## ✨ Features

- 🚀 **Drop-in migration** — Keep your existing `sitemap.ts`, just wrap it
- ⚡ **Advanced generators** — Named generators with automatic sitemap index creation
- 🖼️ **Full spec support** — Images, videos, hreflang alternates out of the box
- 🗂️ **Sitemap indexes** — Auto-generated for large sites with 50,000+ URLs
- 🔒 **Type-safe** — Built on Next.js's `MetadataRoute.Sitemap` types
- 💾 **Caching control** — Use `"use cache"`, Redis, or any strategy you need
- 📦 **Zero config** — No build plugins, no config files, just route handlers

## Why?

Next.js's built-in `sitemap.ts` convention is great for simple sites, but it has limitations:

- **No caching control** — Next.js generates sitemaps on-the-fly without giving you control over `Cache-Control` headers or revalidation strategies.
- **No advanced caching** — Since your sitemap lives in a route handler, you get full control over Next.js caching: use `"use cache"`, `"use cache: remote"` for edge caching, Redis-backed caching, or configure `revalidate` intervals — none of which are possible with the native `sitemap.ts` convention.
- **No custom endpoints** — You're locked into `/sitemap.xml`. Want `/sitemaps/products.xml`? Not possible natively.
- **No sitemap index** — Managing multiple sitemaps for large sites (50,000+ URLs) requires manual wiring.
- **Hard to migrate** — Moving from the native convention to a custom route handler means rewriting your data layer.

`better-next-sitemap` solves all of this with a drop-in migration path and a powerful generators API.

## Installation

```bash
npm install better-next-sitemap
# or
pnpm add better-next-sitemap
# or
yarn add better-next-sitemap
```

## Quick Start

### 1. Basic Migration (Easiest)

Already have a `sitemap.ts`? Migrate in 3 lines.

**Your existing `sitemap.ts`** (keep it as-is):

```ts
// app/sitemap.ts
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
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
}
```

**Create the route handler:**

```ts
// app/my_sitemap.xml/route.ts
import { generateNextSitemap, sitemapResponse } from "better-next-sitemap";
import sitemap from "@/app/sitemap";

export async function GET() {
  const xml = await generateNextSitemap(sitemap);
  return sitemapResponse(xml);
}
```

That's it. Visit `/my_sitemap.xml` and you get valid XML with full support for images, videos, and alternates — all handled automatically.

---

### 2. Migrating `generateSitemaps` (Large Sites)

If you use Next.js's `generateSitemaps` for splitting large datasets, you can migrate that too without changing your data layer.

**Your existing `sitemap.ts` with `generateSitemaps`** (keep it as-is):

```ts
// app/sitemap.e2.ts (renamed from sitemap.ts to avoid conflicts)
import type { MetadataRoute } from "next";

export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];
}

export default async function sitemap(props: {
  id: Promise<string>;
}): Promise<MetadataRoute.Sitemap> {
  const id = +(await props.id);
  const start = id * 50000;

  const products = Array.from({ length: 5 }, (_, i) => ({
    id: start + i,
    date: new Date().toISOString(),
  }));

  return products.map((product) => ({
    url: `https://example.com/product/${product.id}`,
    lastModified: product.date,
  }));
}
```

**Create the dynamic route handler:**

```ts
// app/sitemaps/[filename]/route.ts
import { generateNextSitemap, sitemapResponse } from "better-next-sitemap";
import { NextResponse } from "next/server";
import sitemap, { generateSitemaps } from "@/app/sitemap.e2";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  const xml = await generateNextSitemap(filename, {
    root: "https://acme.com/sitemaps",
    sitemap: sitemap,
    generateSitemaps,
  });

  if (!xml) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return sitemapResponse(xml);
}
```

This generates:

| URL | Description |
|---|---|
| `/sitemaps/sitemap_index.xml` | Sitemap index listing all sub-sitemaps |
| `/sitemaps/0.xml` | Sitemap for id `0` |
| `/sitemaps/1.xml` | Sitemap for id `1` |
| `/sitemaps/2.xml` | Sitemap for id `2` |
| `/sitemaps/3.xml` | Sitemap for id `3` |

---

### 3. Advanced Generators (Full Control)

For complete control over your sitemap structure, use the `generators` API. Define named generators and the library automatically creates individual sitemaps and a sitemap index.

```ts
// app/sitemaps/[filename]/route.ts
import {
  generateSitemap,
  type SitemapGenerators,
  sitemapResponse,
} from "better-next-sitemap";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const { filename } = await params;

  if (!filename.endsWith(".xml")) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const generators: SitemapGenerators = {
    // Generates: /sitemaps/static.xml
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
    // Generates: /sitemaps/products.xml
    products: async () => {
      const products = await fetchProducts(); // your data source
      return products.map((product) => ({
        url: `https://acme.com/product/${product.id}`,
        lastModified: product.updatedAt,
      }));
    },
  };

  const xml = await generateSitemap(filename, {
    root: "https://acme.com/sitemaps",
    generators,
  });

  if (!xml) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return sitemapResponse(xml);
}
```

This generates:

| URL | Description |
|---|---|
| `/sitemaps/sitemap_index.xml` | Auto-generated index listing `static.xml` and `products.xml` |
| `/sitemaps/static.xml` | Static pages sitemap |
| `/sitemaps/products.xml` | Dynamic products sitemap |

---

## API Reference

### `generateNextSitemap(fn)`

Converts a Next.js sitemap function to XML string.

```ts
function generateNextSitemap(fn: SitemapCallback): Promise<string>;
```

| Parameter | Type | Description |
|---|---|---|
| `fn` | `() => SitemapFile \| Promise<SitemapFile>` | Your existing `sitemap()` function |

**Returns:** `Promise<string>` — the XML string.

---

### `generateNextSitemap(fileId, config)`

Resolves a specific sitemap file from a Next.js `generateSitemaps` setup.

```ts
function generateNextSitemap(
  fileId: string,
  config: SitemapConfig,
): Promise<string | undefined>;
```

| Parameter | Type | Description |
|---|---|---|
| `fileId` | `string` | The requested filename (e.g. `"0.xml"` or `"sitemap_index.xml"`) |
| `config.sitemap` | `(props: { id: Promise<string> }) => Promise<SitemapFile>` | Your existing `sitemap()` function |
| `config.generateSitemaps` | `() => Promise<{ id: string }[]>` | Your existing `generateSitemaps()` function |
| `config.root` | `string` | Base URL for the sitemap index (e.g. `"https://acme.com/sitemaps"`) |
| `config.indexFile` | `string?` | Custom index filename. Default: `"sitemap_index"` |

**Returns:** `Promise<string | undefined>` — XML string, or `undefined` if the file doesn't match.

---

### `generateSitemap(file, options)`

Resolves a sitemap file using the generators API.

```ts
function generateSitemap(
  file: string,
  options: {
    generators: SitemapGenerators;
    root: string;
    indexFile?: string;
  },
): Promise<string | undefined>;
```

| Parameter | Type | Description |
|---|---|---|
| `file` | `string` | The requested filename (e.g. `"static.xml"` or `"sitemap_index.xml"`) |
| `options.generators` | `Record<string, SitemapGenerator>` | Named generator functions. Each key becomes a sitemap file. |
| `options.root` | `string` | Base URL for the sitemap index |
| `options.indexFile` | `string?` | Custom index filename. Default: `"sitemap_index"` |

**Returns:** `Promise<string | undefined>` — XML string, or `undefined` if no generator matches.

---

### `generateSitemapXml(sitemap)`

Low-level utility to convert a `MetadataRoute.Sitemap` array directly into an XML string.

```ts
function generateSitemapXml(sitemap: SitemapFile): string;
```

Supports all standard sitemap fields:
- `url`, `lastModified`, `changeFrequency`, `priority`
- `alternates.languages` (hreflang)
- `images` (image sitemap extension)
- `videos` (video sitemap extension)

XML namespaces are automatically included only when needed.

---

### `generateSitemapIndexXml(options)`

Low-level utility to generate a sitemap index XML string.

```ts
function generateSitemapIndexXml(options: {
  root: string;
  sitemaps: string[];
}): string;
```

---

### `sitemapResponse(xml, headers?)`

Wraps an XML string in a `Response` with `Content-Type: application/xml`.

```ts
function sitemapResponse(xml: string, headers?: HeadersInit): Response;
```

You can pass custom headers to add caching:

```ts
return sitemapResponse(xml, {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate",
});
```

---

## Types

```ts
import type { MetadataRoute } from "next";

// Re-export of Next.js's native sitemap type
type SitemapFile = MetadataRoute.Sitemap;

// A function that returns a sitemap array
type SitemapGenerator = () => SitemapFile | Promise<SitemapFile>;

// A record of named generators
type SitemapGenerators = Record<string, SitemapGenerator>;

// Callback for simple migration
type SitemapCallback = () => SitemapFile | Promise<SitemapFile>;

// Config for generateSitemaps migration
type SitemapConfig = {
  sitemap: (props: { id: Promise<string> }) => Promise<SitemapFile | undefined>;
  generateSitemaps: () => Promise<{ id: string }[]>;
  root: string;
  indexFile?: string;
};
```

---

## Full Feature Support

`better-next-sitemap` supports every sitemap extension that Next.js types define:

### Images

```ts
{
  url: "https://acme.com/blog",
  images: ["https://acme.com/blog/cover.jpg"],
}
```

### Videos

```ts
{
  url: "https://acme.com/video",
  videos: [
    {
      title: "My Video",
      thumbnail_loc: "https://acme.com/thumb.jpg",
      description: "A great video",
      content_loc: "https://acme.com/video.mp4",
      duration: 120,
      tag: "tutorial",
    },
  ],
}
```

### Alternates (hreflang)

```ts
{
  url: "https://acme.com/blog",
  alternates: {
    languages: {
      es: "https://acme.com/es/blog",
      de: "https://acme.com/de/blog",
    },
  },
}
```

---

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT
