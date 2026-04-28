import { getUserLibraryPayloadForApi } from "@/app/lib/library-service";
import { getUser } from "@/app/lib/users";

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

  const { libraryShowIds, libraryShows } = await getUserLibraryPayloadForApi(
    id,
  );

  return Response.json({
    user,
    libraryShowIds,
    libraryShows,
  });
}
