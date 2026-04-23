import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider } from "./context/UserContext";
import { ThemeProvider } from "./context/ThemeContext";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Roboto_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DoIt",
  description: "Task management app",
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
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
