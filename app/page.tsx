import dbConnect from "./lib/db";
import Link from "next/link";
import { getUser } from "./lib/users";

export default async function Home() {
  const id = "65e0df64e483a7bd7222c535";
  const user = await getUser(id);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>Hello</div>
      <Link href="/shows">
        <div>
          <h1 className="hover:cursor-pointer">Go to my shows</h1>
        </div>
      </Link>
    </main>
  );
}
