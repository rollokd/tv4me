import { getSearchResults } from "@/app/lib/api";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ query: string }> },
) {
  const { query } = await params;
  const response = await getSearchResults(query);

  if (!response?.length) {
    return Response.json({ searchResults: [] });
  }

  return Response.json({ searchResults: response });
}
