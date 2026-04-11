import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationLoaderProvider } from "@/app/components/NavigationLoaderProvider";
import NavigationLoaderReset from "@/app/components/NavigationLoaderReset";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export const metadata: Metadata = {
   title: "Aoe4 Community Italia - Classifica, Quiz e Matchmaking",
  description:
    "La community italiana di Age of Empires 4. Classifica aggiornata, quiz competitivi e matchmaking bilanciato per giocatori italiani.",
  icons: {
    icon: "/logo_mettere.png",
  },
    verification: {
    google: "aSa09l_RJ8JF_3m-hu_bBLHrcW7_GrqSn40Ou-LPh2o",
    },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <head>
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7306638646821084"
          crossOrigin="anonymous"
        />

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-EK0YZ5XN6G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-EK0YZ5XN6G');
          `}
        </Script>
      </head>

      <body className="antialiased">
        <NavigationLoaderProvider>
          <NavigationLoaderReset />
          {children}
        </NavigationLoaderProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
