import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  images: {
    // Product and brand images come from S3 / whatever CDN the API hands back.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default createNextIntlPlugin("./src/i18n/request.ts")(nextConfig);
