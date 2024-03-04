import Search from "../ui/search";
import SearchResults from "../ui/searchResults";
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const query = searchParams?.query || "";
  let id = "65e0df64e483a7bd7222c535";

  return (
    <div>
      <h1>Search</h1>
      <Search placeholder="Search for a show" />
      <SearchResults query={query} id={id} />
    </div>
  );
}
