import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";

import "./globals.css";

import { AmbientBackground } from "@/components/layout/ambient";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { TerminalBoot } from "@/components/layout/terminal-boot";
import { VisitBeacon } from "@/components/layout/visit-beacon";
import { siteConfig } from "@/lib/config";
import { getCurrentProfile } from "@/lib/data";

const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });
const ibmPlex = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-ibm-plex", display: "swap" });

export const metadata: Metadata = {
  title: `${siteConfig.name} | Mission Archive`,
  description: siteConfig.tagline,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const profile = await getCurrentProfile();

  return (
    <html lang="en" className={`${jetbrains.variable} ${ibmPlex.variable}`}>
      <body>
        <AmbientBackground />
        <TerminalBoot />
        <VisitBeacon />
        <Nav profile={profile} />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
