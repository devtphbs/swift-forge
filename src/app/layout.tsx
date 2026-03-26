import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SwiftForge - AI-Powered iOS App Builder",
  description: "Build complete SwiftUI apps with AI. Chat to generate code, preview live, and export to App Store.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script src="/swift-syntax.js" async></script>
      </head>
      <body className={geist.className}>{children}</body>
    </html>
  );
}
