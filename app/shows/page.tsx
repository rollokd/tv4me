import { Show, User } from "../lib/definitions";
import ShowsTable from "../ui/shows/shows-table";
import { addShow, createUser, getUser } from "../lib/users";
import { getUsersShowsAndEpisodes } from "../lib/api";
import dbConnect from "../lib/db";

export default async function Page() {
  const id = "65e0df64e483a7bd7222c535";
  // const user = await createUser();
  // await addShow(user.id, 81189, 10);
  // await addShow(user.id, 121361, 10);

  return (
    <div>
      <ShowsTable id={id} />
    </div>
  );
}
