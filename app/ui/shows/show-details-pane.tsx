"use client";

import { useMemo } from "react";
import EpisodeList from "./episode-list";
import { useShowsShell } from "./shows-shell";
import { Card, CardContent } from "@/components/ui/card";

export default function ShowDetailsPane({ showId }: { showId: number }) {
  const { series, userId } = useShowsShell();
  const selectedSeries = useMemo(
    () => series.find((show) => show.id === showId),
    [series, showId],
  );

  if (!selectedSeries) {
    return (
      <Card className="h-full border-border/70 bg-card/85">
        <CardContent className="flex h-full min-h-[420px] flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
          <p className="text-xl font-medium tracking-[-0.03em]">
            Show not found
          </p>
          <p className="max-w-sm text-sm leading-7">
            This show is not currently in your library.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <EpisodeList
      userId={userId}
      currShow={showId}
      selectedSeries={selectedSeries}
      showMobileBackButton
    />
  );
}
