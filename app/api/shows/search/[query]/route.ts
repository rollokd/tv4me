import { getSearchResults } from "@/app/lib/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ query: string }> }
) {
  const { query } = await params;
  console.log("query:", query);
  const response = await getSearchResults(query);

  if (!response) {
    return Response.json({ error: "No results found" }, { status: 404 });
  }

  return Response.json({ searchResults: response });
}
