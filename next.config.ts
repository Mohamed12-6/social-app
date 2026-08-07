import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // يتجاهل أخطاء الـ Types أثناء الـ build
    ignoreBuildErrors: true,
  },
  eslint: {
    // يتجاهل أخطاء الـ ESLint والـ Linter أثناء الـ build
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev",
      },
      {
        protocol: "https",
        hostname: "route-posts.routemisr.com", // 👈 من غير https://
      },
    ],
  },
};

export default nextConfig;