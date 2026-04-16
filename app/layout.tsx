import type { Metadata, Viewport } from "next";
import "./globals.css";
import { NavigationLoaderProvider } from "@/app/components/NavigationLoaderProvider";
import NavigationLoaderReset from "@/app/components/NavigationLoaderReset";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";
import { LanguageProvider } from "@/app/components/LanguageProvider";
import { getTranslations } from "@/app/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { messages } = await getTranslations();

  return {
    title: messages.metadata.siteTitle,
    description: messages.metadata.siteDescription,
    icons: {
      icon: "/logo_mettere.png",
    },
    verification: {
      google: "aSa09l_RJ8JF_3m-hu_bBLHrcW7_GrqSn40Ou-LPh2o",
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { locale, messages } = await getTranslations();

  return (
    <html lang={locale}>
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
        <LanguageProvider locale={locale} messages={messages}>
          <NavigationLoaderProvider>
            <NavigationLoaderReset />
            {children}
          </NavigationLoaderProvider>
        </LanguageProvider>

        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
