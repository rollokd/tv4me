import { getShowsList, getUsersShowsAndEpisodes } from "@/app/lib/api";
import { User } from "@/app/lib/definitions";
import { getUser } from "@/app/lib/users";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  console.log("got request", params.id);
  const id = params.id;
  const user: User = await getUser(id);
  const showIds = user.shows.map((s) => s.showId);
  // console.log(user);
  const [showWEps, series] = await Promise.all([
    getUsersShowsAndEpisodes(showIds),
    getShowsList(showIds),
  ]);
  // console.log(series);
  console.log("got show response");
  return Response.json({ user, showWEps, series });
}
