import ShowsTable from "@/app/ui/shows/shows-table";
import { getShowsAndEpsFromId } from "@/app/lib/actions";
import { auth } from "@/app/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function ShowsPageContent({
  initialShowId,
}: {
  initialShowId: number | null;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const data = await getShowsAndEpsFromId(session.user.id);
  if (!data.ok) {
    return (
      <Alert variant="destructive" className="m-5">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <ShowsTable
      series={data.series}
      userId={session.user.id}
      initialShowId={initialShowId}
    />
  );
}
