import { getUsersShowsAndEpisodes } from "@/app/lib/api";
import { User } from "@/app/lib/definitions";
import { getUser } from "@/app/lib/users";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log("got request", params.id);
  const id = params.id;
  const user: User = await getUser(id);
  // console.log(user);
  const shows = await getUsersShowsAndEpisodes(user.shows.map((s) => s.showId));
  console.log("got show response");
  const data = shows.map((s) => s.data);
  return Response.json({ user, shows: data });
}
