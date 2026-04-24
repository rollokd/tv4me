import { auth } from "@/app/lib/auth";
import { getUserLibraryWithProgress } from "@/app/lib/library-service";
import ShowsShell from "@/app/ui/shows/shows-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function ShowsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  let series;
  try {
    series = await getUserLibraryWithProgress(session.user.id);
  } catch (error) {
    console.error(error);

    return (
      <Alert variant="destructive" className="m-5">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>Failed to load shows.</AlertDescription>
      </Alert>
    );
  }

  return (
    <ShowsShell userId={session.user.id} series={series}>
      {children}
    </ShowsShell>
  );
}
