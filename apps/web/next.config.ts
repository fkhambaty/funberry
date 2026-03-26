import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@funberry/config",
    "@funberry/ui",
    "@funberry/game-engine",
    "@funberry/supabase",
  ],
};

export default nextConfig;
