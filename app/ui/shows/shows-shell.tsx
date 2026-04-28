"use client";

import type { SeriesWithWatchedKeys } from "@/app/lib/library-service";
import type { ShowStatus } from "@/app/lib/shows";
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

type ShowsShellContextValue = {
  userId: string;
  series: SeriesWithWatchedKeys[];
};

const ShowsShellContext = createContext<ShowsShellContextValue | null>(null);

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
  const [activeFilter, setActiveFilter] = useState<ShowStatus>("active");

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
          acc[show.libraryStatus] += 1;
          return acc;
        },
        { total: 0, active: 0, paused: 0, abandoned: 0 },
      ),
    [sortedShows],
  );

  const filteredShows = useMemo(
    () => sortedShows.filter((show) => show.libraryStatus === activeFilter),
    [activeFilter, sortedShows],
  );

  return (
    <ShowsShellContext.Provider value={{ userId, series }}>
      <div className="h-full min-h-0 overflow-hidden bg-[radial-gradient(circle_at_top_right,color-mix(in_oklab,var(--color-accent)_16%,transparent)_0%,transparent_28%),linear-gradient(180deg,color-mix(in_oklab,var(--color-accent)_5%,var(--color-background))_0%,var(--color-background)_52%)]">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-7xl flex-col gap-6 p-2 md:p-4">
          <div className="grid min-h-0 flex-1 gap-6 md:grid-cols-[360px_1fr]">
            <div className={cn("min-h-0", isDetailRoute && "hidden md:block")}>
              <ShowList
                shows={filteredShows}
                currShow={selectedShowId}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                counts={counts}
              />
            </div>

            <div className={cn("min-h-0", !isDetailRoute && "hidden sm:block")}>
              {children}
            </div>
          </div>
        </div>
      </div>
    </ShowsShellContext.Provider>
  );
}
