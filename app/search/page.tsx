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

  return (
    <div>
      <h1>Search</h1>
      <Search placeholder="Search for a show" />
      <SearchResults query={query} />
    </div>
  );
}
