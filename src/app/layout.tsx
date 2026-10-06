import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://progrestive.mhmdfjr.com";
const SITE_NAME = "ProgRestive";
const SITE_DESCRIPTION =
  "Track ur push and pause, score ur balance 0–100, and climb city leaderboards. ProgRestive keeps productivity guilt-free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ProgRestive - Balance Push & Pause",
    template: "%s — ProgRestive",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "productivity tracker",
    "balance index",
    "habit tracker",
    "push and pause",
    "weekly report",
    "city leaderboard",
  ],
  authors: [{ name: "Mr. Sun" }],
  creator: "Mr. Sun",
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    title: "ProgRestive - Balance Push & Pause",
    description: SITE_DESCRIPTION,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "ProgRestive — Balance Push × Pause",
      },
    ],
    // og:image resolved automatically from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "ProgRestive - Balance Push & Pause",
    description: SITE_DESCRIPTION,
    images: ["/opengraph-image"],
    // twitter:image resolved automatically from src/app/opengraph-image.tsx
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffd400",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      founder: { "@type": "Person", name: "Mr. Sun" },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "h-full",
        "antialiased",
        inter.variable,
        spaceGrotesk.variable,
        "font-sans",
      )}
    >
      <body className="min-h-full flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {/* AuthProvider lives in the (app)/(auth) group layouts so the
              public landing page ships zero Firebase JS. */}
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
