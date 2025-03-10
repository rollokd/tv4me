import Search from "../ui/search";
import SearchResults from "../ui/searchResults";
import { auth } from "../lib/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = Array.isArray(searchParams.query)
    ? searchParams.query.join(", ")
    : searchParams.query || "";
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col p-5 grow">
      <div className="flex flex-col p-5 rounded-lg grow">
        <Search placeholder="Search for a show" />
        <SearchResults query={query} id={session.user.id} />
      </div>
    </div>
  );
}
