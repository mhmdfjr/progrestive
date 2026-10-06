"use client";

import * as React from "react";
import { format, parseISO } from "date-fns";
import { enUS as localeEn } from "date-fns/locale";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { useTasks } from "@/lib/hooks/useTasks";
import { useAuth } from "@/lib/auth/AuthContext";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import {
  getDeleteTaskCallable,
  getCompleteTaskCallable,
} from "@/lib/firebase-functions";
import type { TaskDoc } from "@/lib/hooks/useTasks";
import { toast } from "sonner";
import {
  CalendarIcon,
  Plus,
  Briefcase,
  BedDouble,
  BarChart3,
  Clock3,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Inbox,
} from "lucide-react";

function todayStr() {
  const d = new Date();
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function parseDateStr(s: string): Date {
  return parseISO(s + "T12:00:00");
}

export default function HomePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = React.useState(todayStr());
  const { tasks, loading, error } = useTasks(selectedDate);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingTask, setEditingTask] = React.useState<TaskDoc | null>(null);
  const [presetCategory, setPresetCategory] = React.useState<
    "hustle" | "humble" | undefined
  >(undefined);
  const [completingId, setCompletingId] = React.useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = React.useState(false);

  const push = tasks.filter((t) => t.category === "hustle");
  const pause = tasks.filter((t) => t.category === "humble");
  const totalPushScore = tasks
    .filter((t) => t.status === "completed" && t.category === "hustle")
    .reduce((s, t) => s + (t.score || 0), 0);
  const totalPauseScore = tasks
    .filter((t) => t.status === "completed" && t.category === "humble")
    .reduce((s, t) => s + (t.score || 0), 0);
  const totalDuration = tasks.reduce((s, t) => s + t.durationHours, 0);
  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const completedCount = tasks.filter((t) => t.status === "completed").length;
  const durationPct = Math.min((totalDuration / 24) * 100, 100);
  const isOverCap = totalDuration > 24;
  const isNearCap = totalDuration > 20 && totalDuration <= 24;

  const handleEdit = (t: TaskDoc) => {
    setEditingTask(t);
    setDialogOpen(true);
  };
  const handleAdd = (cat?: "hustle" | "humble") => {
    setEditingTask(null);
    setPresetCategory(cat);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const del = getDeleteTaskCallable();
      await del({ taskId: id });
      toast.success("Task deleted", { description: "Task deleted successfully." });
    } catch (e: unknown) {
      const msg = (e as { message?: string }).message || "Delete failed";
      toast.error("Delete failed", { description: msg });
    }
  };

  const handleComplete = async (id: string) => {
    setCompletingId(id);
    try {
      const complete = getCompleteTaskCallable();
      await complete({ taskId: id });
      toast.success("Nice! +points", {
        description: "Task marked done, score is in!",
      });
    } catch (e: unknown) {
      const msg = (e as { message?: string }).message || "Complete failed";
      toast.error("Failed", { description: msg });
    } finally {
      setCompletingId(null);
    }
  };

  const selectedDateObj = React.useMemo(
    () => parseDateStr(selectedDate),
    [selectedDate],
  );
  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Achiever";
  const avatarLetter = displayName.slice(0, 1).toUpperCase();

  return (
    <main className="flex-1 mx-auto w-full bg-background">
      <div className="space-y-6 mx-auto w-full max-w-6xl p-4 md:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="size-12 border-2 border-border shadow-shadow rounded-none bg-accent">
                <AvatarImage src={user?.photoURL || undefined} />
                <AvatarFallback className="rounded-none font-heading font-black bg-accent text-black">
                  {avatarLetter}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="font-heading text-2xl font-black leading-none">
                  Hello, {displayName}!
                </h1>
                <p className="text-xs text-foreground/60 font-bold">
                  {format(selectedDateObj, "EEEE, d MMMM yyyy", {
                    locale: localeEn,
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="neutral"
                    className="gap-2 bg-white font-bold dark:text-black"
                  >
                    <CalendarIcon className="size-4" strokeWidth={2.5} />
                    {format(selectedDateObj, "d MMM yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="p-0 border-0 bg-transparent shadow-none w-auto"
                  align="end"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDateObj}
                    onSelect={(d) => {
                      if (d) {
                        // eslint-disable-next-line @typescript-eslint/no-unused-vars
                        const iso = d.toISOString().slice(0, 10);
                        const localIso = new Date(
                          d.getTime() - d.getTimezoneOffset() * 60000,
                        )
                          .toISOString()
                          .slice(0, 10);
                        setSelectedDate(localIso);
                        setCalendarOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => handleAdd()}
                className="bg-accent text-black border-border font-black gap-1.5"
              >
                <Plus className="size-4" strokeWidth={2.5} /> Add Task
              </Button>
            </div>
          </div>

          {/* Stats overview */}
          <div className="grid gap-3 sm:grid-cols-3">
            <Card className="border-2 bg-secondary-background shadow-shadow py-4 gap-3">
              <CardContent className="px-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-widest flex items-center gap-1 text-push">
                    <Briefcase className="size-3" strokeWidth={2.5} /> PUSH
                  </p>
                  <p className="font-heading text-2xl font-black">
                    {totalPushScore.toFixed(1)}
                  </p>
                  <p className="text-xs font-bold text-foreground/60">
                    {push.length} Tasks •{" "}
                    {push.filter((t) => t.status === "completed").length}{" "}
                    Completed
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center border-2 border-border bg-push shadow-sm">
                  <Briefcase className="size-5 text-white" strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-secondary-background shadow-shadow py-4 gap-3">
              <CardContent className="px-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black tracking-widest flex items-center gap-1 text-pause">
                    <BedDouble className="size-3" strokeWidth={2.5} /> PAUSE
                  </p>
                  <p className="font-heading text-2xl font-black">
                    {totalPauseScore.toFixed(1)}
                  </p>
                  <p className="text-xs font-bold text-foreground/60">
                    {pause.length} Tasks •{" "}
                    {pause.filter((t) => t.status === "completed").length}{" "}
                    Completed
                  </p>
                </div>
                <div className="flex size-10 items-center justify-center border-2 border-border bg-pause shadow-sm">
                  <BedDouble className="size-5 text-black" strokeWidth={2.5} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-secondary-background shadow-shadow py-4 gap-3">
              <CardContent className="px-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-black tracking-widest flex items-center gap-1">
                    <Clock3 className="size-3" strokeWidth={2.5} /> DAILY LOAD
                  </p>
                  <Badge className="font-black bg-accent text-xs border-2">
                    {totalDuration.toFixed(1)} / 24h
                  </Badge>
                </div>
                <Progress
                  value={durationPct}
                  className="mt-3 h-3 border-2 [&>div]:bg-accent"
                />
                <p className="mt-1 text-xs font-bold flex items-center gap-1">
                  {isOverCap ? (
                    <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                      <AlertTriangle className="size-3" strokeWidth={2.5} />{" "}
                      Over 24h cap!
                    </span>
                  ) : isNearCap ? (
                    <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="size-3" strokeWidth={2.5} />{" "}
                      Almost 24h cap, slow down!
                    </span>
                  ) : (
                    <span className="text-foreground/60 flex items-center gap-1">
                      <CheckCircle2 className="size-3" strokeWidth={2.5} />{" "}
                      {pendingCount} Pending • Keep it balanced!
                    </span>
                  )}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Balance hint */}
          <div className="flex flex-wrap gap-2 text-xs font-black">
            <span className="border-2 border-border bg-accent py-1 px-1 shadow-sm flex items-center gap-1 dark:text-black">
              <BarChart3 className="size-3" strokeWidth={2.5} /> Balance: Push{" "}
              {totalPushScore.toFixed(1)} vs Pause{" "}
              {totalPauseScore.toFixed(1)}
            </span>
            <span className="border-2 border-border bg-white py-1 px-1 shadow-sm flex items-center gap-1 dark:text-black">
              <Trophy className="size-3" strokeWidth={2.5} /> {tasks.length}{" "}
              Tasks Today
            </span>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" strokeWidth={2.5} />
            <AlertTitle className="font-black">Failed to load tasks</AlertTitle>
            <AlertDescription className="font-bold">{error}</AlertDescription>
          </Alert>
        )}

        {isOverCap && (
          <Alert className="bg-accent text-black border-border">
            <AlertTriangle className="size-4" strokeWidth={2.5} />
            <AlertTitle className="font-black">
              Daily cap 24hr exceeded!
            </AlertTitle>
            <AlertDescription className="font-bold">
              Reduce ur duration or move to another day, sistem deny to create
              task if total &gt;24h exceeded.
            </AlertDescription>
          </Alert>
        )}

        {/* Main Grid / Carousel Container */}
        {/* CSS scroll-snap swipe on mobile, plain 2-col grid on md+.
            Replaces the embla Carousel (hidden nav buttons made it a pure
            swipe container) so no carousel runtime ships in initial JS. */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2">
            {[0, 1].map((i) => (
              <Card key={i} className="border-2 shadow-shadow">
                <CardHeader>
                  <Skeleton className="h-6 w-24 border-2 border-border" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-20 w-full border-2 border-border" />
                  <Skeleton className="h-20 w-full border-2 border-border" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
          <div className="grid w-full grid-flow-col auto-cols-[88%] gap-6 overflow-x-auto pb-2 snap-x snap-mandatory md:grid-flow-row md:grid-cols-2 md:auto-cols-auto md:overflow-visible md:pb-0 md:snap-none">
            <div className="snap-center">
              <Card className="h-full border-2 shadow-shadow bg-secondary-background flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 border-b-2 border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center border-2 border-border bg-push">
                          <Briefcase
                            className="size-4 text-white"
                            strokeWidth={2.5}
                          />
                        </div>
                        <CardTitle className="text-push text-lg">
                          PUSH
                        </CardTitle>
                        <Badge className="bg-push text-white border-black font-black">
                          {push.length}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="bg-push text-white border-black font-black shadow-shadow"
                        onClick={() => handleAdd("hustle")}
                      >
                        <Plus className="size-3.5" strokeWidth={2.5} /> Push
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 pt-4">
                      {push.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-border bg-(--neo-gray-100) dark:bg-white/10">
                          <Inbox
                            className="mx-auto size-8 text-foreground/40"
                            strokeWidth={2}
                          />
                          <p className="mt-2 text-sm font-black">
                            U don&apos;t have any Push today
                          </p>
                          <p className="mx-auto mt-1 max-w-65 text-xs leading-relaxed text-foreground/60">
                            Let&apos;s add some Push: work, study, or side
                            project to earn points and stay productive.
                          </p>
                          <Button
                            size="sm"
                            className="mt-4 bg-push text-white border-black font-black"
                            onClick={() => handleAdd("hustle")}
                          >
                            <Plus className="size-3.5" strokeWidth={2.5} /> Add
                            Push
                          </Button>
                        </div>
                      ) : (
                        push.map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            onComplete={handleComplete}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            completingId={completingId}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* PAUSE CARD */}
                <div className="snap-center">
                  <Card className="h-full border-2 shadow-shadow bg-secondary-background flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2 border-b-2 border-border">
                      <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center border-2 border-border bg-pause">
                          <BedDouble
                            className="size-4 text-black"
                            strokeWidth={2.5}
                          />
                        </div>
                        <CardTitle className="text-pause text-lg">
                          PAUSE
                        </CardTitle>
                        <Badge className="bg-pause text-black border-black font-black">
                          {pause.length}
                        </Badge>
                      </div>
                      <Button
                        size="sm"
                        className="bg-pause text-black border-black font-black shadow-shadow"
                        onClick={() => handleAdd("humble")}
                      >
                        <Plus className="size-3.5" strokeWidth={2.5} /> Pause
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 pt-4">
                      {pause.length === 0 ? (
                        <div className="text-center py-8 border-2 border-dashed border-border bg-(--neo-gray-100) dark:bg-white/10">
                          <Inbox
                            className="mx-auto size-8 text-foreground/40"
                            strokeWidth={2}
                          />
                          <p className="mt-2 text-sm font-black">
                            U don&apos;t have any Pause today
                          </p>
                          <p className="mx-auto mt-1 max-w-65 text-xs leading-relaxed text-foreground/60">
                            Add some rest time: sleep, take a walk, or do some
                            journaling to stay balanced.
                          </p>
                          <Button
                            size="sm"
                            variant="neutral"
                            className="mt-4 bg-pause font-black dark:text-black"
                            onClick={() => handleAdd("humble")}
                          >
                            <Plus className="size-3.5" strokeWidth={2.5} /> Add
                            Pause
                          </Button>
                        </div>
                      ) : (
                        pause.map((t) => (
                          <TaskCard
                            key={t.id}
                            task={t}
                            onComplete={handleComplete}
                            onEdit={handleEdit}
                            onDelete={handleDelete}
                            completingId={completingId}
                          />
                        ))
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Mobile Swipe Hint */}
              <div className="mt-2 flex justify-center md:hidden">
              <p className="text-xs font-bold tracking-widest text-foreground/60">
                ← Swipe to See Tasks →
              </p>
              </div>
          </>
        )}

        <TaskDialog
          open={dialogOpen}
          onOpenChange={(o) => {
            setDialogOpen(o);
            if (!o) {
              setEditingTask(null);
              setPresetCategory(undefined);
            }
          }}
          initialTask={editingTask}
          defaultDate={selectedDate}
          defaultCategory={presetCategory}
        />
      </div>
    </main>
  );
}
