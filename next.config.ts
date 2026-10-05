import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
  experimental: { workerThreads: true, cpus: 1 },
};

export default nextConfig;
