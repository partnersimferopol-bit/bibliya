import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  // Относительные пути — игра открывается через index.html (file:// или локальный сервер)
  assetPrefix: "./",
};

export default nextConfig;
