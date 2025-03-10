import ShowsTable from "../ui/shows/shows-table";
import { Suspense } from "react";
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

  return (
    <Suspense fallback={<Loading />}>
      <ShowsTable id={session.user.id} />
    </Suspense>
  );
}
