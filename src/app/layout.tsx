import type { Metadata } from "next";
import { IBM_Plex_Mono, JetBrains_Mono } from "next/font/google";

import "./globals.css";

import { AtmospherePanel } from "@/components/audio/atmosphere-panel";
import { AmbientBackground } from "@/components/layout/ambient";
import { Footer } from "@/components/layout/footer";
import { Nav } from "@/components/layout/nav";
import { TerminalBoot } from "@/components/layout/terminal-boot";
import { VideoBackground } from "@/components/layout/video-background";
import { VisitBeacon } from "@/components/layout/visit-beacon";
import { Cursor, PageTransition, SmoothScroll } from "@/components/motion";
import { RouteAtmosphere } from "@/components/providers/route-atmosphere";
import { ThemeProvider } from "@/components/providers/theme-provider";
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
        <ThemeProvider>
          <RouteAtmosphere />

          {/* Environment — deepest first: real rain video, then canvas rain/city. */}
          <VideoBackground />
          <AmbientBackground />

          <Cursor />
          <SmoothScroll />
          <TerminalBoot />
          <VisitBeacon />

          <Nav profile={profile} />
          <PageTransition>
            <main className="relative pt-20 sm:pt-24">{children}</main>
          </PageTransition>
          <Footer />

          <AtmospherePanel />
        </ThemeProvider>
      </body>
    </html>
  );
}
