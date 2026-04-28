import { getUser } from "@/app/lib/users";
import {
  getUserLibraryRows,
  getUserLibraryTmdbIds,
} from "@/app/lib/library-service";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  const id = params.id;
  const user = await getUser(id);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const [libraryShowIds, libraryRows] = await Promise.all([
    getUserLibraryTmdbIds(id),
    getUserLibraryRows(id),
  ]);

  return Response.json({
    user,
    libraryShowIds,
    libraryShows: libraryRows.map((show) => ({
      tmdbTvId: show.tmdbTvId,
      title: show.title,
      status: show.status ?? "active",
    })),
  });
}
