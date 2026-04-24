"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import ShowList from "./show-list";
import EpisodeList from "./episode-list";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type LibraryFilter = "all" | "upcoming" | "returning" | "ended";

interface ShowsTableProps {
  series: SeriesWithWatchedKeys[];
  userId: string;
  initialShowId: number | null;
}

function showFilter(
  show: SeriesWithWatchedKeys,
): Exclude<LibraryFilter, "all"> {
  if (show.status === "Ended") {
    return "ended";
  }
  if (show.next_episode_to_air) {
    return "upcoming";
  }
  return "returning";
}

export default function ShowsTable({
  series,
  userId,
  initialShowId,
}: ShowsTableProps) {
  const sortedShows = useMemo(
    () =>
      series
        ? [...series].sort((a, b) => {
            const da = a.last_air_date
              ? new Date(a.last_air_date).getTime()
              : 0;
            const db = b.last_air_date
              ? new Date(b.last_air_date).getTime()
              : 0;
            return db - da;
          })
        : [],
    [series],
  );

  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");
  const [currShow, setCurrShow] = useState<number | null>(
    () =>
      sortedShows.find((show) => show.id === initialShowId)?.id ??
      sortedShows[0]?.id ??
      null,
  );

  const counts = useMemo(
    () =>
      sortedShows.reduce(
        (acc, show) => {
          acc.total += 1;
          acc[showFilter(show)] += 1;
          return acc;
        },
        { total: 0, upcoming: 0, returning: 0, ended: 0 },
      ),
    [sortedShows],
  );

  const filteredShows = useMemo(() => {
    if (activeFilter === "all") {
      return sortedShows;
    }
    return sortedShows.filter((show) => showFilter(show) === activeFilter);
  }, [activeFilter, sortedShows]);

  const selected = useMemo(
    () =>
      filteredShows.find((show) => show.id === currShow) ??
      filteredShows[0] ??
      null,
    [currShow, filteredShows],
  );

  useEffect(() => {
    if (!selected || typeof window === "undefined") {
      return;
    }

    const targetPath = `/shows/${selected.id}`;
    if (window.location.pathname !== targetPath) {
      window.history.replaceState(window.history.state, "", targetPath);
    }
  }, [selected]);

  return (
    <div className="min-h-full overflow-auto bg-[radial-gradient(circle_at_top_right,_color-mix(in_oklab,var(--color-accent)_16%,transparent)_0%,transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_5%,var(--color-background))_0%,var(--color-background)_52%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <Card className="border-border/70 bg-card/85 shadow-[0_30px_80px_-55px_color-mix(in_oklab,var(--color-accent)_35%,transparent)] backdrop-blur">
          <CardContent className="grid gap-3 p-4 md:grid-cols-4">
            {[
              {
                label: "Total",
                value: counts.total,
                variant: "secondary" as const,
              },
              {
                label: "Upcoming",
                value: counts.upcoming,
                variant: "outline" as const,
              },
              {
                label: "Returning",
                value: counts.returning,
                variant: "outline" as const,
              },
              {
                label: "Ended",
                value: counts.ended,
                variant: "outline" as const,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-border/70 bg-background/65 px-4 py-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
                    {stat.label}
                  </p>
                  <Badge
                    variant={stat.variant}
                    className="rounded-full px-2.5 py-1"
                  >
                    {stat.value}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid min-h-[70vh] gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
          {sortedShows.length ? (
            <ShowList
              shows={filteredShows}
              currShow={selected?.id ?? null}
              setCurrShow={setCurrShow}
              activeFilter={activeFilter}
              setActiveFilter={setActiveFilter}
              counts={counts}
            />
          ) : (
            <Card className="border-border/70 bg-card/85">
              <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-2xl font-medium tracking-[-0.03em]">
                  No shows yet
                </p>
                <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                  Start by searching for something you&apos;re watching and add
                  it to your library.
                </p>
              </CardContent>
            </Card>
          )}

          {sortedShows.length ? (
            <EpisodeList
              userId={userId}
              currShow={selected?.id ?? null}
              selectedSeries={selected}
            />
          ) : (
            <Card className="border-border/70 bg-card/85">
              <CardContent className="flex h-full min-h-[320px] flex-col items-center justify-center gap-2 p-8 text-center">
                <p className="text-2xl font-medium tracking-[-0.03em]">
                  Nothing selected
                </p>
                <p className="max-w-sm text-sm leading-7 text-muted-foreground">
                  Once your library has a show, details and episode progress
                  will appear here.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
