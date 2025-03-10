import { getUsersShowsAndEpisodes } from "@/app/lib/api";
import { getUser } from "@/app/lib/users";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  console.log("got request", params.id);
  const id = params.id;
  const user = await getUser(id);
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
  const showWEps = await getUsersShowsAndEpisodes(user.id);
  console.log("got show response");
  return Response.json({ user, showWEps });
}
