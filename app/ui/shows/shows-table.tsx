"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import ShowList from "./show-list";
import EpisodeList from "./episode-list";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface ShowsTableProps {
  series: SeriesWithWatchedKeys[];
  userId: string;
}

export default function ShowsTable({ series, userId }: ShowsTableProps) {
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

  const [currShow, setCurrShow] = useState<number | null>(
    () => sortedShows[0]?.id ?? null,
  );

  const selected = useMemo(
    () => sortedShows.find((s) => s.id === currShow),
    [sortedShows, currShow],
  );

  const stats = useMemo(() => {
    return sortedShows.reduce(
      (acc, show) => {
        acc.total += 1;
        if (show.status === "Ended") {
          acc.ended += 1;
        } else if (show.next_episode_to_air) {
          acc.upcoming += 1;
        } else {
          acc.active += 1;
        }
        return acc;
      },
      { total: 0, active: 0, upcoming: 0, ended: 0 },
    );
  }, [sortedShows]);

  return (
    <div className="min-h-full overflow-auto bg-[radial-gradient(circle_at_top_right,_color-mix(in_oklab,var(--color-accent)_16%,transparent)_0%,transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_5%,var(--color-background))_0%,var(--color-background)_52%)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <Card className="border-border/70 bg-card/85 shadow-[0_30px_80px_-55px_color-mix(in_oklab,var(--color-accent)_35%,transparent)] backdrop-blur">
          <CardHeader className="gap-5 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
                My Shows
              </p>
              <CardTitle className="text-3xl tracking-[-0.04em] md:text-4xl">
                Your library, without the clutter.
              </CardTitle>
              <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                Browse what you&apos;re watching now, pick a show, and update
                episode progress with a single click.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-3 py-1">
                {stats.total} total
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {stats.active} active
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {stats.upcoming} upcoming
              </Badge>
              <Badge variant="outline" className="rounded-full px-3 py-1">
                {stats.ended} ended
              </Badge>
            </div>
          </CardHeader>
          {selected ? (
            <>
              <Separator />
              <CardContent className="flex flex-col gap-3 pt-5 md:flex-row md:items-center md:justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    Focus
                  </p>
                  <h2 className="text-xl font-medium tracking-[-0.03em]">
                    {selected.name}
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.status ? (
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1"
                    >
                      {selected.status}
                    </Badge>
                  ) : null}
                  {selected.next_episode_to_air?.air_date ? (
                    <Badge variant="outline" className="rounded-full px-3 py-1">
                      Next {selected.next_episode_to_air.air_date}
                    </Badge>
                  ) : null}
                </div>
              </CardContent>
            </>
          ) : null}
        </Card>

        <div className="grid min-h-[70vh] gap-6 xl:grid-cols-[minmax(340px,420px)_minmax(0,1fr)]">
          {sortedShows.length ? (
            <ShowList
              shows={sortedShows}
              currShow={currShow}
              setCurrShow={setCurrShow}
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
              currShow={currShow}
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
