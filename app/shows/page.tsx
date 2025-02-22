import ShowsTable from "../ui/shows/shows-table";
import { Suspense } from "react";
import Loading from "./loading";
import { createUser, findUser } from "../lib/users";

export default async function Page() {
  // let id = "65e0df64e483a7bd7222c535";
  const user = (await findUser()) || (await createUser());
  console.log(user._id.toString());
  // const newUser: User = await createUser();
  // await addShow(id, 81189, 62);
  // await addShow(id, 121361, 73);

  return (
    <Suspense fallback={<Loading />}>
      <ShowsTable id={user._id.toString()} />
    </Suspense>
  );
}
