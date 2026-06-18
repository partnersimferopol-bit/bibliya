import type { NextConfig } from "next";

/** GitHub Pages: https://partnersimferopol-bit.github.io/bibliya/ */
const buildTarget = process.env.BUILD_TARGET ?? "";
const isGithubPages = buildTarget === "github-pages";
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
    NEXT_PUBLIC_BUILD_TARGET: buildTarget,
  },
};

export default nextConfig;
