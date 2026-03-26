"use client";

import dynamic from "next/dynamic";

const PlayContent = dynamic(() => import("./PlayContent"), { ssr: false });

export default function PlayPage() {
  return <PlayContent />;
}
