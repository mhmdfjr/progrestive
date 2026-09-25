import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/lib/auth/AuthContext";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "next-themes";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "700"],
});

const SITE_URL = "https://purrpose.mhmdfjr.com";
const SITE_NAME = "Purrpose";
const SITE_DESCRIPTION =
  "Track ur hustle and humble, score ur balance 0–100, and climb city leaderboards. Purrpose keeps productivity guilt-free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Purrpose - Balance Hustle & Humble",
    template: "%s — Purrpose",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "productivity tracker",
    "balance index",
    "habit tracker",
    "hustle and humble",
    "weekly report",
    "city leaderboard",
  ],
  authors: [{ name: "Mr. Sun" }],
  creator: "Mr. Sun",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    siteName: SITE_NAME,
    title: "Purrpose - Balance Hustle & Humble",
    description: SITE_DESCRIPTION,
    // og:image resolved automatically from src/app/opengraph-image.tsx
  },
  twitter: {
    card: "summary_large_image",
    title: "Purrpose - Balance Hustle & Humble",
    description: SITE_DESCRIPTION,
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
          <AuthProvider>{children}</AuthProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
