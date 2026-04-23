import { ModeToggle } from "@/components/theme-toggle";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import SignOutButton from "@/components/sign-out-button";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function NavBar() {
  return (
    <div className="flex flex-row justify-between items-center bg-blue-600 gap-10 px-5 py-3 shrink-0">
      <div className="flex flex-row items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          className="text-2xl font-semibold text-white hover:bg-white/15"
          asChild
        >
          <Link href="/">TV4Me</Link>
        </Button>
        <Button variant="ghost" className="text-white hover:bg-white/15" asChild>
          <Link href="/shows">My Shows</Link>
        </Button>
        <Button variant="ghost" className="text-white hover:bg-white/15" asChild>
          <Link href="/watch-list">Watch list</Link>
        </Button>
      </div>
      <div className="flex flex-row items-center gap-2 md:gap-4">
        <Button
          variant="ghost"
          className="gap-2 text-white hover:bg-white/15"
          asChild
        >
          <Link href="/search">
            <MagnifyingGlassIcon className="h-[18px] w-[18px]" />
            Search
          </Link>
        </Button>
        <ModeToggle />
        <SignOutButton />
      </div>
    </div>
  );
}

export default NavBar;
