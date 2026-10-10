import type { NextConfig } from "next";
import { WORKOUT_IMAGE_REMOTE_PATTERNS } from "./app/_lib/workout-covers";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: WORKOUT_IMAGE_REMOTE_PATTERNS,
  },
  async rewrites() {
    const backendOrigin = (
      process.env.BACKEND_ORIGIN || "http://localhost:8080"
    ).replace(/\/+$/, "");

    return [
      {
        source: "/backend/:path*",
        destination: `${backendOrigin}/:path*`,
      },
    ];
  },
};

export default nextConfig;
