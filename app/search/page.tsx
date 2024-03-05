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
    <div className="flex flex-col bg-gray-600 p-5 h-full">
      <div className="flex flex-col bg-gray-950 text-white p-5 rounded-lg h-full">
        <Search placeholder="Search for a show" />
        <SearchResults query={query} id={id} />
      </div>
    </div>
  );
}
