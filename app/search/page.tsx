import { createUser, findUser } from "../lib/users";
import Search from "../ui/search";
import SearchResults from "../ui/searchResults";
export default async function Page({
  searchParams,
}: {
  searchParams?: {
    query?: string;
  };
}) {
  const input = await searchParams;
  const query = input?.query || "";
  const user = (await findUser()) || (await createUser());

  return (
    <div className="flex flex-col bg-gray-600 p-5 h-full">
      <div className="flex flex-col bg-gray-950 text-white p-5 rounded-lg h-full">
        <Search placeholder="Search for a show" />
        <SearchResults query={query} id={user._id.toString()} />
      </div>
    </div>
  );
}
