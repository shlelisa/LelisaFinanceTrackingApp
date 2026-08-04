import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["172.16.239.61", "172.16.239.61", "172.16.239.61:3000", "localhost:3000"],
};

export default nextConfig;


