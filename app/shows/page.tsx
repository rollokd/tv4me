import { Show, User } from "../lib/definitions";
import ShowsTable from "../ui/shows/shows-table";
import { getUser } from "../lib/users";
import { getUsersShowsAndEpisodes } from "../lib/api";
import dbConnect from "../lib/db";

export default async function Page() {
  const id = "65e0df64e483a7bd7222c535";
  // const user: User = await getUser(id);
  // console.log(user);
  // const user: User = {
  //   _id: "65e0df64e483a7bd7222c535",
  //   shows: [
  //     {
  //       showId: 81189,
  //       watched: [
  //         false,
  //       ],
  //       _id: "65e1c124e483a7bd7222c554",
  //     },
  //     {
  //       showId: 121361,
  //       watched: [
  //         false,
  //       ],
  //       _id: "65e1d39ce483a7bd7222c567",
  //     },
  //   ],
  // };

  // TODO: move all this logic to the client showTable component and pass the id as a prop
  // const showResponse = await getUsersShowsAndEpisodes(
  //   user.shows.map((s) => s.showId)
  // );
  // console.log("got show response", showResponse);

  // const shows = showResponse.map((s) => s.data);
  // console.log("got all data.", shows);

  return (
    <div>
      <ShowsTable id={id} />
    </div>
  );
}
