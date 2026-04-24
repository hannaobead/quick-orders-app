import type { NextConfig } from "next";

const BUILD_ID = Date.now().toString();

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.184'],
  env: {
    BUILD_ID,
  },
};

export default nextConfig;
