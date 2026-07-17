import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/article/impossible-planet-discovered-nasa',
        destination: '/article/possible-diamond-world-jupiter-mass-neptune-size',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
