export const routes = {
  products: "/products",
};

export const companyRoutes = {};
export const legalRoutes = {};

export function getUrl(path: string = "") {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${p}`;
}
