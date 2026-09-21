import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Product and brand images come from S3 / whatever CDN the API hands back.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    // E2E fixtures point at hosts that do not resolve; optimising them just
    // fills the log with DNS failures. The browser still errors on the image,
    // so the component's fallback is exercised either way.
    unoptimized: process.env.E2E === "1",
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
