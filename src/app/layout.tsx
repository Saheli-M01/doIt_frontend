import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GetDoIt | Smart Task Management",
  description: "Manage your tasks efficiently and elegantly with DoIt.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo_dark.png",
        href: "/logo_dark.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo_light.png",
        href: "/logo_light.png",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Preload both logo variants to avoid flash on theme switch */}
        <link rel="preload" href="/brand_light.png" as="image" />
        <link rel="preload" href="/brand_dark.png" as="image" />
        <link rel="preload" href="/logo_light.png" as="image" />
        <link rel="preload" href="/logo_dark.png" as="image" />
        {/* Disable CSS transitions on first paint to prevent FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                document.body && document.body.classList.add('no-transitions');
                window.addEventListener('load', function(){
                  requestAnimationFrame(function(){
                    document.body && document.body.classList.remove('no-transitions');
                  });
                });
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ClerkProvider>
          <Providers>{children}</Providers>
        </ClerkProvider>

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-W7DFFXHNZ6"
          strategy="afterInteractive"
        />
        <Script id="ga-script" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-W7DFFXHNZ6');
        `}</Script>
      </body>
    </html>
  );
}
