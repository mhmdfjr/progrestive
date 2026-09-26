import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { BarChart3, Briefcase, Trophy, Users } from "lucide-react";

// Split into its own chunk (loaded via next/dynamic in src/app/page.tsx) so
// the embla-carousel runtime never lands in the landing page's initial JS.
export function HowItWorks() {
  const slides = [
    {
      badge: "01 - DAILY",
      title: "Add task, mark as done",
      desc: "Choose category, level 1-5, duration in hours. Complete → score level×duration directly added. Incomplete = ‘Have no time’, not failed.",
      icon: Briefcase,
      color: "var(--color-hustle)",
    },
    {
      badge: "02 - WEEKLY",
      title: "View Balance 0-100",
      desc: "Weekly report calculates balance index, total Hustle/Humble scores, and improvement suggestions with AI enhancement.",
      icon: BarChart3,
      color: "var(--color-accent)",
    },
    {
      badge: "03 - COMPETE",
      title: "Climb the leaderboard",
      desc: "Leaderboard per city. Balance ur day and compete with users. Top 3 get a badge to collect and share.",
      icon: Trophy,
      color: "var(--color-info)",
    },
  ];

  return (
    <section
      id="how"
      className="bg-secondary-background border-t-2 border-border"
    >
      <div className="mx-auto max-w-6xl px-4 py-12 md:py-16">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <h2 className="font-heading text-3xl font-black md:text-4xl">
            Start with{" "}
            <span className="border-2 border-border bg-info px-2 text-white shadow-shadow">
              Only 3 Steps.
            </span>
          </h2>
          <p className="max-w-md text-sm text-foreground/70">
            Conventional flow (clear navigation, standard hierarchy),
            gamification is just an approach, not to confuse.
          </p>
        </div>

        <Carousel className="mt-8" opts={{ align: "start" }}>
          <CarouselContent>
            {slides.map((s) => (
              <CarouselItem key={s.badge} className="md:basis-1/2 lg:basis-1/3">
                <Card className="h-full border-border bg-background">
                  <CardHeader>
                    <Badge className="w-fit border-border bg-white text-black font-black">
                      {s.badge}
                    </Badge>
                    <div
                      className="mt-3 flex size-12 items-center justify-center border-2 border-border shadow-shadow"
                      style={{ background: s.color }}
                    >
                      <s.icon
                        className="size-6 text-white"
                        strokeWidth={2.5}
                        style={{
                          color:
                            s.color === "var(--color-accent)" ||
                            s.color === "var(--color-humble)"
                              ? "black"
                              : "white",
                        }}
                      />
                    </div>
                    <CardTitle className="text-xl leading-tight">
                      {s.title}
                    </CardTitle>
                    <p className="text-sm leading-relaxed text-foreground/70">
                      {s.desc}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-border bg-white p-3 text-xs font-bold text-black">
                      <div className="flex items-center gap-2">
                        <Users className="size-4" strokeWidth={2.5} />
                        Group: Jakarta • Rank #3 • Score 42.1
                      </div>
                      <div className="mt-2 h-2 border border-border bg-(--neo-gray-100)">
                        <div
                          className="h-full bg-black"
                          style={{
                            width:
                              s.badge === "01 — DAILY"
                                ? "70%"
                                : s.badge === "02 — WEEKLY"
                                  ? "62%"
                                  : "88%",
                          }}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>

        <div className="mt-6 flex justify-center md:hidden">
          <p className="text-xs font-bold tracking-widest">← Swipe to see →</p>
        </div>
      </div>
    </section>
  );
}
