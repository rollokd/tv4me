"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import ShowList from "./show-list";

type LibraryFilter = "all" | "upcoming" | "returning" | "ended";

type ShowsShellContextValue = {
  userId: string;
  series: SeriesWithWatchedKeys[];
};

const ShowsShellContext = createContext<ShowsShellContextValue | null>(null);

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

export function useShowsShell() {
  const context = useContext(ShowsShellContext);

  if (!context) {
    throw new Error("useShowsShell must be used within ShowsShell");
  }

  return context;
}

export default function ShowsShell({
  userId,
  series,
  children,
}: {
  userId: string;
  series: SeriesWithWatchedKeys[];
  children: ReactNode;
}) {
  const segment = useSelectedLayoutSegment();
  const selectedShowId = useMemo(() => {
    if (!segment) {
      return null;
    }

    const showId = Number(segment);
    return Number.isInteger(showId) && showId > 0 ? showId : null;
  }, [segment]);
  const isDetailRoute = selectedShowId !== null;
  const [activeFilter, setActiveFilter] = useState<LibraryFilter>("all");

  const sortedShows = useMemo(
    () =>
      [...series].sort((a, b) => {
        const da = a.last_air_date ? new Date(a.last_air_date).getTime() : 0;
        const db = b.last_air_date ? new Date(b.last_air_date).getTime() : 0;
        return db - da;
      }),
    [series],
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

  return (
    <ShowsShellContext.Provider value={{ userId, series }}>
      <div className="min-h-full overflow-auto bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-accent)_16%,transparent)_0%,transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_5%,var(--color-background))_0%,var(--color-background)_52%)]">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 p-2 md:p-4">

          <div className="grid min-h-[70vh] gap-6 md:grid-cols-[360px_1fr]">
     
            <div className={cn(isDetailRoute && "hidden md:block")}>
              <ShowList
                shows={filteredShows}
                currShow={selectedShowId}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                counts={counts}
              />
            </div>

            <div className={cn(!isDetailRoute && "hidden sm:block")}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ShowsShellContext.Provider>
  );
}
