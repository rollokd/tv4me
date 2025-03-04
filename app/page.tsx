import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default async function Home() {
  // const id = "65e0df64e483a7bd7222c535";
  // const user: User = await getUser(id);
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Welcome to TV4Me</h1>
        <div>It's a work in progress</div>
      </div>
      <div className="flex gap-5">
        <Link
          href={"/login"}
          className={buttonVariants({ variant: "default" })}
        >
          <h2>Login</h2>
        </Link>
        <Link href="/signup" className={buttonVariants({ variant: "outline" })}>
          <h2>Sign Up</h2>
        </Link>
      </div>
      <Link href="/shows">
        <div>
          <h2 className="hover:cursor-pointer">Go to my shows</h2>
        </div>
      </Link>
    </main>
  );
}
