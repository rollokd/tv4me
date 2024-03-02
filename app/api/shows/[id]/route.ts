import { getShowsList, getUsersShowsAndEpisodes } from "@/app/lib/api";
import { User } from "@/app/lib/definitions";
import { getUser } from "@/app/lib/users";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
  const seriesData = series.map((s) => s.data);
  const data = showWEps.map((s) => s.data);
  return Response.json({ user, series: data, seriesData });
}
