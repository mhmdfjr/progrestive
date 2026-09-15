"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Toggle } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === "dark" : false;

  return (
    <Toggle
      size="sm"
      pressed={isDark}
      onPressedChange={(pressed) => setTheme(pressed ? "dark" : "light")}
      aria-label={isDark ? "Ganti ke light mode" : "Ganti ke dark mode"}
      title={isDark ? "Ganti ke light mode" : "Ganti ke dark mode"}
      className={cn("w-9 min-w-0 shrink-0 px-0 shadow-shadow", className)}
    >
      <span className="relative block size-5">
        <Sun
          className={cn(
            "absolute inset-0 size-5 transition-all",
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100",
          )}
        />
        <Moon
          className={cn(
            "absolute inset-0 size-5 transition-all",
            isDark
              ? "rotate-0 scale-100 opacity-100"
              : "-rotate-90 scale-0 opacity-0",
          )}
        />
      </span>
      <span className="sr-only">Toggle theme</span>
    </Toggle>
  );
}
