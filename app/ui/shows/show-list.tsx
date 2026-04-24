"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import Image from "next/image";
import clsx from "clsx";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import { useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TvIcon, Clock3Icon, SparklesIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

type LibraryFilter = "all" | "upcoming" | "returning" | "ended";

function ShowItem({
  show,
  currShow,
  setCurrShow,
  epsLeft,
}: {
  show: SeriesWithWatchedKeys;
  currShow: number | null;
  setCurrShow: (showId: number) => void;
  epsLeft: number;
}) {
  return (
    <Item
      className={clsx(
        "cursor-pointer rounded-2xl border border-border/70 bg-background/70 px-4 py-4 transition hover:border-accent/50 hover:bg-accent/5",
        currShow === show.id &&
          "border-accent/60 bg-accent/8 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]",
      )}
      key={show.id}
      onClick={() => setCurrShow(show.id)}
      variant="outline"
    >
      {show.poster_path && (
        <ItemMedia variant="image" className="size-16 rounded-2xl">
          <Image
            className="rounded-2xl"
            loader={imageLoader}
            width={120}
            height={180}
            src={show.poster_path}
            alt={show.name}
          />
        </ItemMedia>
      )}
      {!show.poster_path ? (
        <ItemMedia
          variant="icon"
          className="size-16 rounded-2xl border-border/70 bg-muted/60"
        >
          <TvIcon className="size-5" />
        </ItemMedia>
      ) : null}
      <ItemContent className="gap-3">
        <ItemHeader className="items-start">
          <div className="space-y-2">
            <ItemTitle className="text-base tracking-[-0.02em] md:text-lg">
              {show.name}
            </ItemTitle>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="rounded-full px-2.5 py-1">
                {show.status || "Unknown"}
              </Badge>
              {show.next_episode_to_air ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-accent/30 px-2.5 py-1"
                >
                  <SparklesIcon className="size-3.5" />
                  Upcoming
                </Badge>
              ) : null}
            </div>
          </div>
        </ItemHeader>
        <ItemDescription className="line-clamp-1 text-sm">
          {show.next_episode_to_air ? (
            <>Next: {prettyDate(show.next_episode_to_air.air_date)}</>
          ) : show.last_air_date ? (
            <>Last: {prettyDate(show.last_air_date)}</>
          ) : (
            <>Last air date unknown</>
          )}
        </ItemDescription>
        <ItemFooter className="justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Clock3Icon className="size-3.5" />
            <span>{epsLeft === 0 ? "Caught up" : `${epsLeft} left`}</span>
          </div>
          <span className="text-[11px] uppercase tracking-[0.22em]">
            {currShow === show.id ? "Selected" : "Open"}
          </span>
        </ItemFooter>
      </ItemContent>
    </Item>
  );
}

function airedEpisodeCount(show: SeriesWithWatchedKeys) {
  if (show.status === "Ended") {
    return (
      show.seasons
        ?.filter((season) => season.season_number > 0)
        .reduce((sum, season) => sum + (season.episode_count ?? 0), 0) ?? 0
    );
  }

  if (show.last_episode_to_air) {
    return (
      (show.seasons
        ?.filter(
          (season) =>
            season.season_number > 0 &&
            season.season_number < show.last_episode_to_air!.season_number,
        )
        .reduce((sum, season) => sum + (season.episode_count ?? 0), 0) ?? 0) +
      show.last_episode_to_air.episode_number
    );
  }

  return 0;
}

export default function ShowList({
  shows,
  currShow,
  setCurrShow,
  activeFilter,
  setActiveFilter,
  counts,
}: {
  shows: SeriesWithWatchedKeys[];
  currShow: number | null;
  setCurrShow: (id: number) => void;
  activeFilter: LibraryFilter;
  setActiveFilter: (filter: LibraryFilter) => void;
  counts: {
    total: number;
    upcoming: number;
    returning: number;
    ended: number;
  };
}) {
  useEffect(() => {
    if (currShow === null && shows.length > 0) {
      setCurrShow(shows[0].id);
    }
  }, [currShow, shows, setCurrShow]);

  function epsLeftFor(show: SeriesWithWatchedKeys) {
    const watchedCount = show.watchedEpisodeKeys.length;
    const airedCount = airedEpisodeCount(show);
    return Math.max(0, airedCount - watchedCount);
  }

  const showNodes = useMemo(
    () =>
      shows.map((show) => (
        <ShowItem
          key={show.id}
          show={show}
          currShow={currShow}
          setCurrShow={setCurrShow}
          epsLeft={epsLeftFor(show)}
        />
      )),
    [currShow, setCurrShow, shows],
  );

  return (
    <Card className="min-h-0 border-border/70 bg-card/85 shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
      <CardHeader className="gap-4 pb-4">
        <CardTitle className="text-xl tracking-[-0.03em]">Library</CardTitle>
        <Tabs
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as LibraryFilter)}
        >
          <TabsList className="h-auto w-full flex-wrap rounded-2xl bg-background/70 p-1.5">
            {(
              [
                { value: "all", label: "All", count: counts.total },
                {
                  value: "upcoming",
                  label: "Upcoming",
                  count: counts.upcoming,
                },
                {
                  value: "returning",
                  label: "Returning",
                  count: counts.returning,
                },
                { value: "ended", label: "Ended", count: counts.ended },
              ] satisfies {
                value: LibraryFilter;
                label: string;
                count: number;
              }[]
            ).map(({ value, label, count }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-xl px-3 py-2 text-xs uppercase tracking-[0.18em]"
              >
                {label}
                <Badge
                  variant="secondary"
                  className="ml-1 rounded-full px-2 py-0.5 text-[10px]"
                >
                  {count}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="min-h-0">
        <ScrollArea className="h-[min(72vh,820px)] pr-3">
          {showNodes.length ? (
            <ItemGroup className="gap-3">{showNodes}</ItemGroup>
          ) : (
            <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/45 px-6 text-center text-sm text-muted-foreground">
              No shows match this filter.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
