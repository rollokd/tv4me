import { getTvEpisode } from "@/app/lib/api";

export async function GET(
  _request: Request,
  props: {
    params: Promise<{
      id: string;
      seasonNumber: string;
      episodeNumber: string;
    }>;
  },
) {
  const params = await props.params;
  const showId = Number(params.id);
  const seasonNumber = Number(params.seasonNumber);
  const episodeNumber = Number(params.episodeNumber);

  if (
    !Number.isInteger(showId) ||
    showId <= 0 ||
    !Number.isInteger(seasonNumber) ||
    seasonNumber < 0 ||
    !Number.isInteger(episodeNumber) ||
    episodeNumber <= 0
  ) {
    return Response.json({ error: "Invalid episode path" }, { status: 400 });
  }

  try {
    const episode = await getTvEpisode(showId, seasonNumber, episodeNumber);
    return Response.json({ episode });
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to load episode",
      },
      { status: 502 },
    );
  }
}
