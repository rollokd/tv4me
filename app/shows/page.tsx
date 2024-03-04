import { Show, User } from "../lib/definitions";
import ShowsTable from "../ui/shows/shows-table";
import { addShow, createUser, getUser } from "../lib/users";
import { getUsersShowsAndEpisodes } from "../lib/api";
import dbConnect from "../lib/db";

export default async function Page() {
  let id = "65e0df64e483a7bd7222c535";
  // const newUser: User = await createUser();
  // await addShow(id, 81189, 62);
  // await addShow(id, 121361, 73);

  return (
    <div>
      <ShowsTable id={id} />
    </div>
  );
}
