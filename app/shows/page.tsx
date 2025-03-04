import ShowsTable from "../ui/shows/shows-table";
import { Suspense } from "react";
import Loading from "./loading";

export default async function Page() {
  const user = { _id: "65e0df64e483a7bd7222c535" };
  // const user = (await findUser()) || (await createUser());
  // console.log("id", user._id.toString());
  // const newUser: User = await createUser();
  // await addShow(id, 81189, 62);
  // await addShow(id, 121361, 73);

  return (
    <Suspense fallback={<Loading />}>
      <ShowsTable id={user._id.toString()} />
    </Suspense>
  );
}
