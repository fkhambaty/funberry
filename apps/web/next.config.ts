import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@funberry/config",
    "@funberry/ui",
    "@funberry/game-engine",
    "@funberry/supabase",
  ],
  serverExternalPackages: ["framer-motion", "canvas-confetti"],
};

export default nextConfig;
