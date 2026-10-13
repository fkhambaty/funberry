import type { Metadata, Viewport } from "next";
import { Baloo_2, Fredoka, Nunito } from "next/font/google";
import { brand } from "@funberry/config";
import "./globals.css";
import { ClientLayout } from "./ClientLayout";

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-baloo",
  display: "swap",
});

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
    <html lang="en" className={`${nunito.variable} ${fredoka.variable} ${baloo.variable}`}>
      <body className="fb-app min-h-dvh">
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
