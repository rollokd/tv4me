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
import {
  TvIcon,
  Clock3Icon,
  SparklesIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  BanIcon,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import {
  isTmdbSeriesConcluded,
  libraryAiringSection,
  type LibraryAiringSection,
} from "@/app/lib/tmdb-airing";

type AiringSection = LibraryAiringSection;

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
    "rounded-xl border border-border/60 bg-background/80 px-3 py-3 transition active:bg-accent/5 sm:rounded-2xl sm:px-4 sm:py-3.5 sm:hover:border-accent/40 sm:hover:bg-accent/5",
    currShow === show.id &&
      "border-accent/55 bg-accent/8 shadow-[0_14px_36px_-24px_color-mix(in_oklab,var(--color-accent)_40%,transparent)]",
  );

  const content = (
    <>
      {show.poster_path && (
        <ItemMedia variant="image" className="size-14 shrink-0 rounded-lg sm:h-[4.5rem] sm:w-12 sm:rounded-xl">
          <Image
            className="rounded-lg object-cover sm:rounded-xl"
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
          className="size-14 shrink-0 rounded-lg border-border/60 bg-muted/50 sm:size-[4.5rem] sm:rounded-xl"
        >
          <TvIcon className="size-4 sm:size-5" />
        </ItemMedia>
      ) : null}
      <ItemContent className="min-w-0 gap-1.5 sm:gap-2">
        <ItemHeader className="items-start">
          <div className="min-w-0 space-y-1 sm:space-y-1.5">
            <ItemTitle className="text-[15px] leading-snug tracking-[-0.02em] sm:text-base md:text-lg">
              {show.name}
            </ItemTitle>
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:hidden">
              <span className="truncate">{show.status || "Unknown"}</span>
              {show.next_episode_to_air ? (
                <span className="shrink-0 text-accent">
                  Next {prettyDate(show.next_episode_to_air.air_date)}
                </span>
              ) : show.last_air_date ? (
                <span className="shrink-0">
                  Last {prettyDate(show.last_air_date)}
                </span>
              ) : null}
            </div>
            <div className="hidden flex-wrap gap-1.5 sm:flex sm:gap-2">
              <Badge variant="secondary" className="rounded-full px-2 py-0.5 text-xs">
                {show.status || "Unknown"}
              </Badge>
              {show.next_episode_to_air ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-accent/25 px-2 py-0.5 text-xs"
                >
                  <SparklesIcon className="size-3" />
                  Upcoming
                </Badge>
              ) : null}
            </div>
          </div>
        </ItemHeader>
        <ItemDescription className="hidden text-sm sm:line-clamp-1 sm:block">
          {show.next_episode_to_air ? (
            <>Next: {prettyDate(show.next_episode_to_air.air_date)}</>
          ) : show.last_air_date ? (
            <>Last: {prettyDate(show.last_air_date)}</>
          ) : (
            <>Last air date unknown</>
          )}
        </ItemDescription>
        <ItemFooter className="mt-0.5 justify-between gap-2 text-[11px] text-muted-foreground sm:text-xs">
          <div className="flex min-w-0 items-center gap-1.5">
            <Clock3Icon className="size-3 shrink-0 opacity-80" />
            <span className="truncate">
              {epsLeft === 0 ? "Caught up" : `${epsLeft} left`}
            </span>
          </div>
          {currShow === show.id ? (
            <span className="hidden shrink-0 uppercase tracking-wider sm:inline">
              Selected
            </span>
          ) : null}
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

function airedEpisodeCount(show: SeriesWithWatchedKeys) {
  if (isTmdbSeriesConcluded(show.status)) {
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
          groups[libraryAiringSection(show)].push(show);
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
    <Card className="flex h-full min-h-0 gap-0 border-border/60 bg-card/90 shadow-[0_20px_50px_-40px_color-mix(in_oklab,var(--color-accent)_22%,transparent)] sm:border-border/70 sm:shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
      <CardHeader className="gap-3 pb-3 sm:gap-4 sm:pb-4">
        <CardTitle className="text-lg tracking-[-0.03em] sm:text-xl">
          Library
        </CardTitle>
        <Tabs
          value={activeFilter}
          onValueChange={(value) => setActiveFilter(value as ShowStatus)}
        >
          <TabsList className="h-auto w-full flex-wrap gap-0.5 rounded-xl bg-background/80 p-1 sm:rounded-2xl sm:bg-background/70">
            {(
              [
                {
                  value: "active",
                  label: <PlayCircleIcon />,
                  count: counts.active,
                },
                {
                  value: "paused",
                  label: <PauseCircleIcon />,
                  count: counts.paused,
                },
                {
                  value: "abandoned",
                  label: <BanIcon />,
                  count: counts.abandoned,
                },
              ] satisfies {
                value: ShowStatus;
                label: React.ReactNode;
                count: number;
              }[]
            ).map(({ value, label, count }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg px-2 py-2 text-[11px] uppercase sm:flex-initial sm:px-3 sm:text-xs"
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
      <CardContent className="min-h-0 flex-1 overflow-hidden">
        <ScrollArea className="h-full pr-3">
          {hasShows ? (
            <Accordion
              type="multiple"
              defaultValue={["upcoming", "returning", "ended"]}
              className="space-y-2 sm:space-y-3"
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
                    className="overflow-hidden rounded-lg border border-border/60 bg-background/60 px-0 sm:border-border/70 sm:bg-background/55"
                  >
                    <AccordionTrigger className="px-2.5 py-2.5 text-left hover:no-underline sm:px-3 sm:py-3">
                      <div className="flex w-full items-center justify-between gap-2 pr-1 sm:gap-3 sm:pr-2">
                        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
                          {section.label}
                        </span>
                        <Badge variant="secondary" className="rounded-md px-1.5 py-0 text-[11px] sm:px-2 sm:text-xs">
                          {section.shows.length}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-2 sm:pb-3">
                      <ItemGroup className="gap-2 px-2 sm:gap-3 sm:px-3">
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
            <div className="flex min-h-70 items-center justify-center rounded-2xl border border-dashed border-border/70 bg-background/45 px-6 text-center text-sm text-muted-foreground">
              No shows match this filter.
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
