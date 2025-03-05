"use client";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { toast } from "sonner";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Welcome to TV4Me</h1>
        <div>It&apos;s a work in progress</div>
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
      <Button onClick={() => toast("Test Toast")}>
        <h2 className="hover:cursor-pointer">Test Toast</h2>
      </Button>
    </main>
  );
}
