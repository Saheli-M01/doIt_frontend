import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoIt | Smart Task Management",
  description: "Manage your tasks efficiently and elegantly with DoIt.",
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/logo_light.png",
        href: "/logo_light.png",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/logo_dark.png",
        href: "/logo_dark.png",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
