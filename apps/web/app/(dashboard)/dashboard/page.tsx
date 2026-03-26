"use client";

import dynamic from "next/dynamic";

const DashboardContent = dynamic(() => import("./DashboardContent"), { ssr: false });

export default function DashboardPage() {
  return <DashboardContent />;
}
