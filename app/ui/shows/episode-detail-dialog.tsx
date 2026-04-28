"use client";

import { imageLoader, prettyDate } from "@/app/lib/client-utils";
import type { TmdbEpisode } from "@/app/queries/tmdb/show-details";
import {
  tmdbEpisodeDetailQueryOptions,
} from "@/app/queries/tmdb/episode-detail";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoaderCircleIcon as AnimatedLoaderCircleIcon } from "@/components/ui/loader-circle";
import { CircleCheckIcon } from "@/components/ui/circle-check";
import { CircleDashedIcon } from "@/components/ui/circle-dashed";
import { CalendarDaysIcon, ClockIcon, StarIcon } from "lucide-react";
import Image from "next/image";
import type { MouseEvent } from "react";
import { useQuery } from "@tanstack/react-query";

function crewByJob(
  crew: { job?: string; name?: string }[] | undefined,
  job: string,
) {
  if (!crew?.length) return [];
  return crew
    .filter((c) => c.job?.toLowerCase() === job.toLowerCase())
    .map((c) => c.name)
    .filter(Boolean) as string[];
}

function crewByJobs(
  crew: { job?: string; name?: string }[] | undefined,
  jobs: string[],
) {
  if (!crew?.length) return [];
  const want = new Set(jobs.map((j) => j.toLowerCase()));
  const names = new Set<string>();
  for (const c of crew) {
    if (c.job && want.has(c.job.toLowerCase()) && c.name) {
      names.add(c.name);
    }
  }
  return [...names];
}

export default function EpisodeDetailDialog({
  open,
  onOpenChange,
  showId,
  listEpisode,
  isWatched,
  unaired,
  isPending,
  watchActionsDisabled,
  onWatchClick,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  showId: number;
  listEpisode: TmdbEpisode | null;
  isWatched: boolean;
  unaired: boolean;
  isPending: boolean;
  watchActionsDisabled: boolean;
  onWatchClick: (e: MouseEvent<HTMLButtonElement>) => void;
}) {
  const season = listEpisode?.season_number ?? 0;
  const epNum = listEpisode?.episode_number ?? 0;
  const detailQuery = useQuery(
    tmdbEpisodeDetailQueryOptions(
      showId,
      season,
      epNum,
      open && !!listEpisode && season >= 0 && epNum > 0,
    ),
  );

  const detail = detailQuery.data;
  const title =
    detail?.name ?? listEpisode?.name ?? "Episode";
  const overview =
    (detail?.overview && detail.overview.trim()) ||
    (listEpisode?.overview && listEpisode.overview.trim()) ||
    null;
  const airDate = detail?.air_date ?? listEpisode?.air_date ?? null;
  const stillPath = detail?.still_path ?? null;
  const runtime = detail?.runtime ?? null;
  const voteAverage = detail?.vote_average;
  const directors = crewByJob(detail?.crew, "Director");
  const writers = crewByJobs(detail?.crew, [
    "Writer",
    "Teleplay",
    "Story",
    "Screenplay",
  ]);
  const guests = detail?.guest_stars?.filter((g) => g.name) ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton
        className="max-h-[min(90vh,720px)] w-[calc(100%-1.5rem)] max-w-lg gap-0 overflow-hidden p-0 sm:max-w-xl"
      >
        <div className="max-h-[min(90vh,720px)] overflow-y-auto overscroll-contain">
          <DialogHeader className="gap-1 border-b border-border/60 p-4 text-left sm:p-5">
            <DialogDescription className="text-xs font-medium tracking-wide text-muted-foreground">
              Season {season} · Episode {epNum}
            </DialogDescription>
            <DialogTitle className="pr-8 text-left text-lg leading-snug sm:text-xl">
              {title}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Full details from{" "}
              <span className="font-medium text-foreground/80">TMDB</span>{" "}
              (The Movie Database).
            </p>
          </DialogHeader>

          <div className="space-y-4 p-4 sm:p-5">
            {detailQuery.isLoading ? (
              <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
                <AnimatedLoaderCircleIcon className="animate-spin" size={20} />
                Loading episode details…
              </div>
            ) : null}

            {detailQuery.error ? (
              <p className="text-sm text-destructive">
                {detailQuery.error instanceof Error
                  ? detailQuery.error.message
                  : "Could not load details."}
              </p>
            ) : null}

            {stillPath ? (
              <div className="overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                <Image
                  loader={imageLoader}
                  src={stillPath}
                  alt={title}
                  width={640}
                  height={360}
                  className="aspect-video w-full object-cover"
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {airDate ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-1">
                  <CalendarDaysIcon className="size-3.5 shrink-0" />
                  {prettyDate(airDate)}
                </span>
              ) : null}
              {typeof runtime === "number" && runtime > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-1">
                  <ClockIcon className="size-3.5 shrink-0" />
                  {runtime} min
                </span>
              ) : null}
              {typeof voteAverage === "number" && voteAverage > 0 ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-1">
                  <StarIcon className="size-3.5 shrink-0" />
                  {voteAverage.toFixed(1)}
                </span>
              ) : null}
              {detail?.episode_type ? (
                <Badge variant="outline" className="text-[11px] font-normal">
                  {detail.episode_type}
                </Badge>
              ) : null}
            </div>

            {directors.length ? (
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-foreground">Director</span>
                <span className="text-muted-foreground"> · </span>
                {directors.join(", ")}
              </p>
            ) : null}

            {writers.length ? (
              <p className="text-sm leading-relaxed">
                <span className="font-medium text-foreground">Writer</span>
                <span className="text-muted-foreground"> · </span>
                {writers.join(", ")}
              </p>
            ) : null}

            {overview ? (
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {overview}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                No synopsis available.
              </p>
            )}

            {guests.length ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Guest cast
                </p>
                <ul className="space-y-1.5 text-sm">
                  {guests.slice(0, 12).map((g, i) => (
                    <li key={`${g.name}-${i}`}>
                      <span className="font-medium">{g.name}</span>
                      {g.character ? (
                        <span className="text-muted-foreground">
                          {" "}
                          as {g.character}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
                {guests.length > 12 ? (
                  <p className="text-xs text-muted-foreground">
                    +{guests.length - 12} more
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="sticky bottom-0 flex gap-2 border-t border-border/60 bg-background/95 p-4 backdrop-blur-sm sm:p-5">
            <Button
              type="button"
              variant={isWatched ? "secondary" : "default"}
              className="flex-1 gap-2"
              disabled={unaired || watchActionsDisabled}
              onClick={onWatchClick}
            >
              {isPending ? (
                <AnimatedLoaderCircleIcon className="animate-spin" size={18} />
              ) : isWatched ? (
                <CircleCheckIcon size={18} />
              ) : (
                <CircleDashedIcon size={18} />
              )}
              {isWatched ? "Mark unwatched" : "Mark watched"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
