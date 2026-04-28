import { notFound } from "next/navigation";
import ShowDetailsPane from "@/app/ui/shows/show-details-pane";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const showId = Number(params.id);

  if (!Number.isInteger(showId) || showId <= 0) {
    notFound();
  }

  return <ShowDetailsPane showId={showId} />;
}
