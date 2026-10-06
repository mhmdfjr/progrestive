"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";

export type SiteNavLink = {
  href: string;
  label: string;
};

export type SiteHeaderCta = {
  href: string;
  label: string;
  showArrow?: boolean;
};

type SiteHeaderProps = {
  links: SiteNavLink[];
  primaryCta: SiteHeaderCta;
  secondaryCta?: SiteHeaderCta;
  className?: string;
};

export function SiteHeader({
  links,
  primaryCta,
  secondaryCta,
  className,
}: SiteHeaderProps) {
  const [open, setOpen] = React.useState(false);
  const pathname = usePathname();

  // Close the mobile menu whenever the route / hash changes
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const showArrow = primaryCta.showArrow ?? true;

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b-2 border-border bg-secondary-background",
        className,
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-4 py-3">
        <Link
          href="/"
          className="font-heading text-xl font-black tracking-tight"
          onClick={() => setOpen(false)}
        >
          PROGRESTIVE<span className="text-push">.</span>
          <span className="text-pause">.</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 font-heading font-bold md:flex">
          {links.map((l) => (
            <Link
              key={l.href + l.label}
              href={l.href}
              className="hover:underline underline-offset-4"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Switch dark/light — selalu terlihat, di kiri CTA */}
          <ThemeToggle />
          {/* CTA desktop saja — di layar kecil hanya hamburger yang tampil */}
          <div className="hidden items-center gap-2 md:flex">
            {secondaryCta && (
              <Button variant="neutral" size="sm" asChild>
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
            <Button
              asChild
              size="sm"
              className="bg-accent text-black hover:translate-x-boxShadowX hover:translate-y-boxShadowY"
            >
              <Link href={primaryCta.href}>
                {primaryCta.label}
                {showArrow && <ArrowRight className="size-4" />}
              </Link>
            </Button>
          </div>

          {/* Hamburger — hanya layar kecil */}
          <Button
            type="button"
            variant="neutral"
            size="icon"
            className="size-9 bg-accent md:hidden"
            aria-label={open ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu panel */}
      {open && (
        <div
          id="site-mobile-menu"
          className="border-t-2 border-border bg-secondary-background md:hidden"
        >
          <nav className="mx-auto flex w-full flex-col items-end gap-1 px-4 py-3 font-heading font-bold">
            {links.map((l) => (
              <Link
                key={l.href + l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-2 border-transparent px-3 py-2 hover:border-border hover:bg-background hover:shadow-shadow"
              >
                {l.label}
              </Link>
            ))}
            {/* 2 CTA di dalam hamburger menu */}
            <div className="mt-2 w-full flex gap-2">
              {secondaryCta && (
                <Button variant="neutral" size="sm" asChild className="w-full">
                  <Link href={secondaryCta.href} onClick={() => setOpen(false)}>
                    {secondaryCta.label}
                  </Link>
                </Button>
              )}
              <Button
                asChild
                size="sm"
                className="w-full bg-accent text-black hover:translate-x-boxShadowX hover:translate-y-boxShadowY"
              >
                <Link href={primaryCta.href} onClick={() => setOpen(false)}>
                  {primaryCta.label}
                  {showArrow && <ArrowRight className="size-4" />}
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export function AuthHeader() {
  const pathname = usePathname();
  const isRegister = pathname?.startsWith("/register");

  return (
    <SiteHeader
      links={[
        { href: "/", label: "Home" },
        { href: "/#about", label: "About" },
        { href: "/#how", label: "How it works" },
      ]}
      secondaryCta={{ href: "/", label: "Home" }}
      primaryCta={
        isRegister
          ? { href: "/login", label: "Login" }
          : { href: "/register", label: "Register" }
      }
    />
  );
}

export function LandingHeader() {
  return (
    <SiteHeader
      links={[
        { href: "/", label: "Home" },
        { href: "#about", label: "About" },
        { href: "#how", label: "How it works" },
      ]}
      secondaryCta={{ href: "#about", label: "Learn more" }}
      primaryCta={{ href: "/login", label: "Login" }}
    />
  );
}
