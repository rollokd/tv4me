import { getSeriesInfo } from "@/app/lib/api";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const showId = Number(params.id);

  if (!Number.isInteger(showId) || showId <= 0) {
    return Response.json({ error: "Invalid show id" }, { status: 400 });
  }

  try {
    const series = await getSeriesInfo(showId);
    return Response.json({ series });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load show data",
      },
      { status: 502 },
    );
  }
}
