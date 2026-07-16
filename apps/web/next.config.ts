import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ems/shared"],
  async rewrites() {
    const apiTarget = process.env.NEXT_PUBLIC_API_URL;
    if (!apiTarget) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${apiTarget}/:path*`
      }
    ];
  }
};

export default nextConfig;
