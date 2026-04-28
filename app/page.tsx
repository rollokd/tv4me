"use client";

import Link from "next/link";
import { ArrowRightIcon, PlayCircleIcon } from "@heroicons/react/24/outline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="relative min-h-full overflow-auto bg-[radial-gradient(circle_at_top_left,_color-mix(in_oklab,var(--color-accent)_20%,transparent)_0%,transparent_36%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_8%,var(--color-background))_0%,var(--color-background)_58%)]">
      <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-6 py-12 md:px-10 md:py-20">
        <section className="grid flex-1 items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(320px,420px)]">
          <div className="max-w-3xl space-y-8">
            <Badge
              variant="outline"
              className="rounded-full border-accent/30 bg-background/70 px-4 py-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground"
            >
              Track what&apos;s next
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl leading-none font-semibold tracking-[-0.05em] md:text-7xl">
                A quieter way to keep your TV life in order.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                TV4Me keeps your library, episode progress, and Marathon imports
                in one place without turning the experience into a dashboard
                circus.
              </p>
              <p className="max-w-xl text-sm uppercase tracking-[0.24em] text-muted-foreground/80">
                Save shows. Track episodes. Pick up exactly where you left off.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="h-12 rounded-full px-6 text-sm font-medium"
              >
                <Link href="/signup">
                  Start your library
                  <ArrowRightIcon className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full px-6 text-sm font-medium"
              >
                <Link href="/login">
                  <PlayCircleIcon className="size-4" />
                  Sign in
                </Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/60 bg-card/80 shadow-[0_30px_100px_-50px_color-mix(in_oklab,var(--color-accent)_40%,transparent)] backdrop-blur">
            <CardHeader className="space-y-3">
              <Badge
                variant="secondary"
                className="w-fit rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
              >
                Built for personal tracking
              </Badge>
              <CardTitle className="text-2xl tracking-[-0.03em]">
                Everything you need, nothing you don&apos;t.
              </CardTitle>
              <CardDescription className="text-sm leading-7">
                A clean place to manage your shows, import your history, and
                keep episode progress synced to what you actually watch.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {[
                {
                  title: "Library first",
                  description:
                    "Keep your current rotation visible without losing the long-tail backlog.",
                },
                {
                  title: "Episode-aware",
                  description:
                    "Track per-episode progress so finished seasons actually feel finished.",
                },
                {
                  title: "Import-friendly",
                  description:
                    "Bring over Marathon exports and continue from the same place.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-border/70 bg-background/70 p-4"
                >
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
