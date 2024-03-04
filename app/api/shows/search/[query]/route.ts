import { getSearchResults } from "@/app/lib/api";

export async function GET(
  request: Request,
  { params }: { params: { query: string } }
) {
  const query = params.query;
  console.log("query:", query);
  const response = await getSearchResults(query);
  return Response.json({ searchResults: response.data });
}
