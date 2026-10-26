import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Для Docker: в .next/standalone только нужные файлы и server.js.
  output: "standalone",
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    serverActions: {
      // Фото с телефона весят до 10–15 МБ; сервер уменьшает их сам.
      bodySizeLimit: "16mb",
    },
  },
};

export default nextConfig;
