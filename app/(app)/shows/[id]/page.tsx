import { notFound } from "next/navigation";
import ShowsPageContent from "../_components/shows-page-content";

export default async function Page(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const showId = Number(params.id);

  if (!Number.isInteger(showId) || showId <= 0) {
    notFound();
  }

  return <ShowsPageContent initialShowId={showId} />;
}
