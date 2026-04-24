import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Card, CardContent } from "@/components/ui/card";
import { TvIcon } from "lucide-react";

export default function ShowsEmptyPane() {
  return (
    <Card className="border-border/70 bg-card/85 shadow-[0_24px_70px_-50px_color-mix(in_oklab,var(--color-accent)_25%,transparent)]">
      <CardContent className="flex min-h-[420px] p-6 md:p-8">
        <Empty className="flex-1 rounded-3xl border-border/70 bg-background/45">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <TvIcon />
            </EmptyMedia>
            <EmptyTitle>Pick something from your library</EmptyTitle>
            <EmptyDescription>
              Choose a show to view recent episodes, track progress, and jump
              back in where you left off.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>
  );
}
