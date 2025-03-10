import ShowsTable from "../ui/shows/shows-table";
import { Suspense } from "react";
import { getShowsFromId } from "../lib/actions";
import Loading from "./loading";
import { auth } from "../lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    redirect("/login");
  }

  const response = await getShowsFromId(session.user.id);
  const data = await JSON.parse(response);
  if (data === "failed") {
    return <div>Error fetching shows</div>;
  }
  console.log(data);

  return (
    <Suspense fallback={<Loading />}>
      <ShowsTable series={data.series} />
    </Suspense>
  );
}
