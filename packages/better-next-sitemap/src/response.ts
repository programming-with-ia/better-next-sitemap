export function sitemapResponse(xml: string, headers?: HeadersInit) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml",
      ...headers,
    },
  });
}
