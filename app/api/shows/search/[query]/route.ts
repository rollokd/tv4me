import { getSearchResults } from "@/app/lib/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ query: string }> },
) {
  const { query } = await params;
  console.log("query:", query);
  const response = await getSearchResults(query);
  return Response.json({ searchResults: response });
}
