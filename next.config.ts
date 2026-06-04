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
  // На GitHub Pages — абсолютные пути; локально — относительные для index.html
  assetPrefix: isGithubPages ? "/bibliya/" : "./",
};

export default nextConfig;
