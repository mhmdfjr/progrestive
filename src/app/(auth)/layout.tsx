import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { AuthHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (user) {
    redirect("/home");
  }
  return (
    <div className="min-h-screen flex flex-col bg-secondary-background">
      <AuthHeader />
      <main className="flex flex-1 items-center justify-center p-4 md:p-8 bg-background">
        {children}
      </main>
      <footer className="border-t-2 border-border bg-secondary-background">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <div className="flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
            <div className="font-heading font-black">
              PURRPOSE: Track Hustle & Humble.
            </div>
            <div className="flex gap-4 text-xs font-bold">
              <Link href="#about" className="hover:underline">
                About
              </Link>
              <Link href="#how" className="hover:underline">
                How it works
              </Link>
              <Link href="/" className="hover:underline">
                Home
              </Link>
            </div>
          </div>
          <p className="mt-3 text-xs text-foreground/60">
            © {new Date().getFullYear()} Purrpose. Built with Luv by Mr. Sun.
          </p>
        </div>
      </footer>
    </div>
  );
}
