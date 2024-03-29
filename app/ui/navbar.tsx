import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

function NavBar(props: Readonly<{}>) {
  return (
    <div className="flex flex-row justify-between items-center text-white w-dvh bg-blue-600 gap-10 px-5 py-3">
      <div className="flex flex-row items-center gap-10">
        <Link href={"/"} className="text-3xl">
          TV4Me
        </Link>
        <Link href={"/shows"}>My Shows</Link>
      </div>
      <Link
        className="flex flex-row justify-center items-center gap-1"
        href={"/search"}
      >
        <MagnifyingGlassIcon className="h-[18px] w-[18px] text-white peer-focus:text-gray-900" />
        Search
      </Link>
    </div>
  );
}

export default NavBar;
