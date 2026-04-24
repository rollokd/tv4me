"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import type { ShowStatus } from "@/app/lib/shows";
import Image from "next/image";
import clsx from "clsx";
import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import { useMemo } from "react";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";

type AiringSection = "upcoming" | "returning" | "ended";

function ShowItem({
  show,
  currShow,
  epsLeft,
}: {
  show: SeriesWithWatchedKeys;
  currShow: number | null;
  epsLeft: number;
}) {
  const itemClassName = clsx(
    "rounded-2xl border border-border/70 bg-background/70 px-4 py-4 transition hover:border-accent/50 hover:bg-accent/5",
    currShow === show.id &&
      "border-accent/60 bg-accent/8 shadow-[0_18px_40px_-28px_color-mix(in_oklab,var(--color-accent)_45%,transparent)]",
  );

  const content = (
    <>
      {show.poster_path && (
        <ItemMedia variant="image" className="h-18 w-12 rounded">
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
    </>
  );

  return (
    <Link href={`/shows/${show.id}`} className="block">
      <Item className={itemClassName} variant="outline">
        {content}
      </Item>
    </Link>
  );
}

function airingSection(show: SeriesWithWatchedKeys): AiringSection {
  if (show.status === "Ended") {
    return "ended";
  }
  if (show.next_episode_to_air) {
    return "upcoming";
  }
  return "returning";
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
  activeFilter,
  setActiveFilter,
  counts,
}: {
  shows: SeriesWithWatchedKeys[];
  currShow: number | null;
  activeFilter: ShowStatus;
  setActiveFilter: (filter: ShowStatus) => void;
  counts: {
    total: number;
    active: number;
    paused: number;
    abandoned: number;
  };
}) {
  function epsLeftFor(show: SeriesWithWatchedKeys) {
    const watchedCount = show.watchedEpisodeKeys.length;
    const airedCount = airedEpisodeCount(show);
    return Math.max(0, airedCount - watchedCount);
  }

  const groupedShows = useMemo(
    () =>
      shows.reduce(
        (groups, show) => {
          groups[airingSection(show)].push(show);
          return groups;
        },
        {
          upcoming: [] as SeriesWithWatchedKeys[],
          returning: [] as SeriesWithWatchedKeys[],
          ended: [] as SeriesWithWatchedKeys[],
        },
      ),
    [shows],
  );
  const hasShows = shows.length > 0;

  return (
    <Card className="min-h-0 border-border/70 bg-card/85 shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
      <CardHeader className="gap-4 pb-4">
        <CardTitle className="text-xl tracking-[-0.03em]">Library</CardTitle>
        <Tabs
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as ShowStatus)}
        >
          <TabsList className="h-auto w-full flex-wrap rounded-2xl bg-background/70">
            {(
              [
                { value: "active", label: "Active", count: counts.active },
                { value: "paused", label: "Paused", count: counts.paused },
                {
                  value: "abandoned",
                  label: "Abandoned",
                  count: counts.abandoned,
                },
              ] satisfies {
                value: ShowStatus;
                label: string;
                count: number;
              }[]
            ).map(({ value, label, count }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="text-xs uppercase flex items-center gap-1"
              >
                {label}
                <Badge
                  variant="secondary"
                  className="rounded-full px-2 py-0.5 text-xs"
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
          {hasShows ? (
            <Accordion
              type="multiple"
              defaultValue={["upcoming", "returning", "ended"]}
              className="space-y-3"
            >
              {(
                [
                  {
                    value: "upcoming",
                    label: "Upcoming",
                    shows: groupedShows.upcoming,
                  },
                  {
                    value: "returning",
                    label: "Returning",
                    shows: groupedShows.returning,
                  },
                  { value: "ended", label: "Ended", shows: groupedShows.ended },
                ] satisfies {
                  value: AiringSection;
                  label: string;
                  shows: SeriesWithWatchedKeys[];
                }[]
              )
                .filter((section) => section.shows.length > 0)
                .map((section) => (
                  <AccordionItem
                    key={section.value}
                    value={section.value}
                    className="overflow-hidden rounded-lg border border-border/70 bg-background/55 px-0"
                  >
                    <AccordionTrigger className="px-3 py-3 text-left hover:no-underline">
                      <div className="flex w-full items-center justify-between gap-3 pr-2">
                        <span className="text-xs font-medium uppercase text-muted-foreground">
                          {section.label}
                        </span>
                        <Badge variant="secondary" className="rounded-md">
                          {section.shows.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <ItemGroup className="gap-3 px-3">
                        {section.shows.map((show) => (
                          <ShowItem
                            key={show.id}
                            show={show}
                            currShow={currShow}
                            epsLeft={epsLeftFor(show)}
                          />
                        ))}
                      </ItemGroup>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
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
