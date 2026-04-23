import ShowsTable from "../ui/shows/shows-table";
import { Suspense } from "react";
import { getShowsAndEpsFromId } from "../lib/actions";
import Loading from "./loading";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default async function Page() {
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
    <Suspense fallback={<Loading />}>
      <ShowsTable
        series={data.series}
        userId={session.user.id}
      />
    </Suspense>
  );
}
