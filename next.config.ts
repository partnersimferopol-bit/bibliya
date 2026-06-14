import type { NextConfig } from "next";

/** GitHub Pages: https://partnersimferopol-bit.github.io/bibliya/ */
const isGithubPages = process.env.BUILD_TARGET === "github-pages";
const basePath = isGithubPages ? "/bibliya" : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  assetPrefix: isGithubPages ? "/bibliya/" : "./",
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default nextConfig;
