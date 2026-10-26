// Адрес сайта без слэша в конце. Нужен при сборке: robots, sitemap, Open Graph.
export const SITE_URL = (
  process.env.SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
