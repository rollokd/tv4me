import { createUser, findUser } from "../lib/users";
import Search from "../ui/search";
import SearchResults from "../ui/searchResults";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export default async function Page(props: { searchParams: SearchParams }) {
  const searchParams = await props.searchParams;
  const query = Array.isArray(searchParams.query)
    ? searchParams.query.join(", ")
    : searchParams.query || "";
  const user = (await findUser()) || (await createUser());

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex flex-col bg-gray-600 p-5 grow">
      <div className="flex flex-col bg-gray-950 text-white p-5 rounded-lg grow">
        <Search placeholder="Search for a show" />
        <SearchResults query={query} id={user._id.toString()} />
      </div>
    </div>
  );
}
