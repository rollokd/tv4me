import { getSearchResults } from "../lib/api";
import { Response, SearchResponse } from "../lib/definitions";

export default async function SearchResults({ query }: { query: string }) {
  let response: Response<SearchResponse[]> = { status: "loading", data: [] };
  if (query) {
    response = await getSearchResults(query);
    console.log("got data for query:", query);
  }
  return (
    <div>
      <h1>Search Results</h1>
      <p>Results for {query}</p>
      {response.status !== "loading" ? (
        <ol>
          {response.data.map((result) => {
            return <li key={result.id}>{result.name}</li>;
          })}
        </ol>
      ) : (
        <div>Loading...</div>
      )}
    </div>
  );
}
