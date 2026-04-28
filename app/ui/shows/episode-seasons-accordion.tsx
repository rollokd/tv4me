"use client";

import type { MouseEvent } from "react";
import type { TmdbEpisode } from "@/app/queries/tmdb/show-details";
import clsx from "clsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { CircleDashedIcon } from "@/components/ui/circle-dashed";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemHeader,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@/components/ui/item";
import { LoaderCircleIcon as AnimatedLoaderCircleIcon } from "@/components/ui/loader-circle";
import { CalendarDaysIcon, TvIcon } from "lucide-react";
import { prettyDate } from "@/app/lib/client-utils";

type SeasonBlock = readonly [number, TmdbEpisode[]];

export default function EpisodeSeasonsAccordion({
  seasonsOrdered,
  defaultSeasonValue,
  watchedSet,
  pendingWatchedSet,
  focusEpisodeId,
  onEpisodeOpen,
  onWatchedClick,
  watchActionsDisabled,
}: {
  seasonsOrdered: SeasonBlock[];
  defaultSeasonValue: string[];
  watchedSet: Set<string>;
  pendingWatchedSet: Set<string>;
  focusEpisodeId: number | null;
  onEpisodeOpen: (episode: TmdbEpisode) => void;
  onWatchedClick: (
    e: MouseEvent<HTMLButtonElement>,
    episode: TmdbEpisode,
  ) => void;
  watchActionsDisabled: boolean;
}) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultSeasonValue}
      className="space-y-3 sm:space-y-4"
    >
      {seasonsOrdered.map(([seasonNum, seasonEps]) => (
        <AccordionItem
          key={seasonNum}
          value={`season-${seasonNum}`}
          className="overflow-hidden rounded-xl border border-border/60 bg-background/75 px-0 last:border sm:rounded-2xl sm:border-border/70 sm:bg-background/70"
        >
          <AccordionTrigger className="px-3 py-3 text-left hover:no-underline sm:px-4 sm:py-3.5">
            <div className="flex w-full items-center justify-between gap-3">
              <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground sm:text-sm sm:tracking-[0.18em]">
                Season {seasonNum}
              </h2>
              <Badge
                variant="outline"
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] sm:px-2.5 sm:py-1 sm:text-[11px]"
              >
                {seasonEps.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <ItemGroup className="border-t border-border/70">
              {seasonEps.map((episode, epIndex) => {
                const key = `${episode.season_number}:${episode.episode_number}`;
                const isWatched = watchedSet.has(key);
                const isPending = pendingWatchedSet.has(key);
                const air = episode.air_date
                  ? new Date(episode.air_date).getTime()
                  : 0;
                const unaired = air > Date.now();
                return (
                  <div key={episode.id}>
                    {epIndex > 0 ? <ItemSeparator /> : null}
                    <Item
                      className={clsx(
                        "cursor-pointer rounded-none border-0 bg-transparent px-3 py-3 sm:px-4 sm:py-3.5",
                        focusEpisodeId === episode.id && "bg-accent/6",
                        unaired && "text-muted-foreground",
                      )}
                      onClick={() => onEpisodeOpen(episode)}
                    >
                      <ItemMedia
                        variant="icon"
                        className={clsx(
                          "size-9 rounded-xl border-border/60 bg-muted/50 sm:size-11 sm:rounded-2xl sm:border-border/70 sm:bg-muted/60",
                          focusEpisodeId === episode.id &&
                            "border-accent/40 bg-accent/10",
                        )}
                      >
                        <TvIcon className="size-3.5 sm:size-4" />
                      </ItemMedia>
                      <ItemContent className="min-w-0 gap-1 sm:gap-2">
                        <ItemHeader className="items-start">
                          <div className="min-w-0 space-y-1 sm:space-y-1.5">
                            <ItemTitle className="text-[13px] leading-snug tracking-[-0.01em] sm:text-sm md:text-base">
                              <span className="text-muted-foreground">
                                E{episode.episode_number}
                              </span>{" "}
                              {episode.name}
                            </ItemTitle>
                            <div className="flex flex-wrap gap-1.5">
                              {isWatched ? (
                                <Badge
                                  variant="secondary"
                                  className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]"
                                >
                                  Watched
                                </Badge>
                              ) : null}
                              {unaired ? (
                                <Badge
                                  variant="outline"
                                  className="rounded-full px-2 py-0.5 text-[10px] sm:text-[11px]"
                                >
                                  Unaired
                                </Badge>
                              ) : null}
                            </div>
                          </div>
                          <ItemActions>
                            <Button
                              type="button"
                              size="icon-lg"
                              variant={isWatched ? "secondary" : "default"}
                              className={clsx(
                                "shrink-0 rounded-full touch-manipulation",
                                "[&_svg]:size-6!",
                                "shadow-sm transition-transform active:scale-95",
                              )}
                              aria-label={
                                isWatched
                                  ? `Mark episode ${episode.episode_number} as unwatched`
                                  : `Mark episode ${episode.episode_number} as watched`
                              }
                              disabled={
                                unaired || watchActionsDisabled
                              }
                              onClick={(e) => onWatchedClick(e, episode)}
                            >
                              {isPending ? (
                                <AnimatedLoaderCircleIcon
                                  className="animate-spin"
                                  size={32}
                                />
                              ) : isWatched ? (
                                <CircleCheckIcon size={32} />
                              ) : (
                                <CircleDashedIcon size={32} />
                              )}
                            </Button>
                          </ItemActions>
                        </ItemHeader>
                        {episode.overview ? (
                          <ItemDescription className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm sm:leading-6">
                            {episode.overview}
                          </ItemDescription>
                        ) : null}
                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground sm:text-xs">
                          <CalendarDaysIcon className="size-3 shrink-0 opacity-80" />
                          <span>
                            {episode.air_date
                              ? prettyDate(episode.air_date)
                              : "Air date unknown"}
                          </span>
                        </div>
                      </ItemContent>
                    </Item>
                  </div>
                );
              })}
            </ItemGroup>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
