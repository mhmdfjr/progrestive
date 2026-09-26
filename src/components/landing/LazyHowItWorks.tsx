"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Genuinely lazy: the embla runtime downloads only when the section is about
// to enter the viewport — unlike a plain next/dynamic (ssr:true), whose chunk
// still ships in the initial payload for hydration.
const HowItWorks = dynamic(() => import("./HowItWorks").then((m) => m.HowItWorks), {
  ssr: false,
  loading: () => (
    <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
      <div className="h-10 w-64 animate-pulse border-2 border-border bg-white/50" />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-64 animate-pulse border-2 border-border bg-white/50"
          />
        ))}
      </div>
    </div>
  ),
});

export function LazyHowItWorks() {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el || visible) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visible]);

  return (
    <div
      id="how"
      ref={ref}
      className="scroll-mt-20 bg-secondary-background border-t-2 border-border"
    >
      {visible ? (
        <HowItWorks />
      ) : (
        <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
          <div className="h-10 w-64 animate-pulse border-2 border-border bg-white/50" />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse border-2 border-border bg-white/50"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
