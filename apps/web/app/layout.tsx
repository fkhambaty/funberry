import type { Metadata, Viewport } from "next";
import { brand } from "@funberry/config";
import "@fontsource-variable/baloo-2";
import "@fontsource-variable/fredoka";
import "@fontsource-variable/nunito";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";

const siteUrl = "https://www.funberrykids.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: `${brand.name} - Fun Learning Games for Kids`,
  description: brand.tagline,
  alternates: { canonical: siteUrl },
  openGraph: {
    title: `${brand.name} - Fun Learning Games for Kids`,
    description: brand.tagline,
    url: siteUrl,
    siteName: brand.name,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: brand.tagline,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#379df9",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="fb-app min-h-dvh">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
